// 로컬 전용 API 게이트웨이 — 배포 환경의 단일 도메인 인그레스(서비스별 경로 라우팅)를
// 로컬에서 흉내낸다. total-backend 는 게이트웨이 없이 서비스별로 포트가 분리돼 있어서
// (auth 8081 / order 8082 / payment 8083 / product 8084 / wms 8085 / user 8088),
// FE Route Handler 가 기대하는 단일 `API_INTERNAL_URL` 계약(env.ts, api-convention)을
// 로컬에서도 유지하려면 이 프록시가 필요하다.
//
// 사용법: node scripts/local-gateway.mjs (또는 npm run dev:gateway)
//         .env.local 의 API_INTERNAL_URL 을 http://localhost:4000 (기본 GATEWAY_PORT) 으로 맞춘다.
import http from 'node:http';

const PORT = Number(process.env.GATEWAY_PORT ?? 4000);

// total-backend services/*/src/main/java 의 @RequestMapping 기준 (경로 접두어 → 포트).
// 새 서비스/컨트롤러가 생기면 여기 추가한다.
const ROUTES = [
  ['/api/v1/auth', 8081],
  ['/api/v1/carts', 8082],
  ['/api/v1/orders', 8082],
  ['/internal/v1/orders', 8082],
  ['/api/v1/payments', 8083],
  ['/internal/v1/payments', 8083],
  ['/api/v1/products', 8084],
  ['/internal/v1/products', 8084],
  ['/api/v1/wms', 8085],
  ['/internal/v1/wms', 8085],
  ['/api/v1/users', 8088],
  ['/internal/v1/users', 8088],
].sort((a, b) => b[0].length - a[0].length);

function resolvePort(pathname) {
  return ROUTES.find(([prefix]) => pathname.startsWith(prefix))?.[1];
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function errorBody(message) {
  return JSON.stringify({ status: 'ERROR', message, data: null });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  const targetPort = resolvePort(url.pathname);

  if (!targetPort) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(errorBody(`[local-gateway] 라우팅 규칙에 없는 경로: ${url.pathname}`));
    return;
  }

  const method = req.method ?? 'GET';
  const body = method === 'GET' || method === 'HEAD' ? undefined : await readBody(req);
  const upstreamHeaders = { ...req.headers };
  delete upstreamHeaders.host;
  delete upstreamHeaders.connection;

  try {
    // manual 필수 — OAuth 콜백처럼 Spring 이 302(Location + Set-Cookie)로 응답하는 걸
    // 그대로 돌려줘야 하는 라우트가 있다(callback/[provider]/route.ts). follow(기본값)면
    // 이 fetch 가 redirect 를 자체적으로 먹어버려서 Location 이 사라진다.
    const upstream = await fetch(`http://localhost:${targetPort}${url.pathname}${url.search}`, {
      method,
      headers: upstreamHeaders,
      body,
      redirect: 'manual',
    });

    const responseHeaders = {};
    for (const [key, value] of upstream.headers) {
      const lower = key.toLowerCase();
      if (['content-encoding', 'content-length', 'transfer-encoding', 'connection'].includes(lower))
        continue;
      responseHeaders[key] = value;
    }
    if (typeof upstream.headers.getSetCookie === 'function') {
      const setCookies = upstream.headers.getSetCookie();
      if (setCookies.length > 0) responseHeaders['set-cookie'] = setCookies;
    }

    res.writeHead(upstream.status, responseHeaders);
    res.end(Buffer.from(await upstream.arrayBuffer()));
  } catch (err) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(
      errorBody(
        `[local-gateway] :${targetPort} 서비스에 연결할 수 없습니다 (안 떠 있을 수 있음): ${err instanceof Error ? err.message : String(err)}`,
      ),
    );
  }
});

server.listen(PORT, () => {
  console.log(`[local-gateway] listening on http://localhost:${PORT}`);
  for (const [prefix, port] of ROUTES) {
    console.log(`  ${prefix.padEnd(24)} -> :${port}`);
  }
});
