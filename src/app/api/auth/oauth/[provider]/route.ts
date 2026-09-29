import { type NextRequest } from 'next/server';

import { fail, ok } from '@/lib/apiResponse';
import { isOAuthProvider } from '@/lib/constants';
import { env } from '@/lib/env';
import { setOAuthTransactionCookies } from '@/lib/oauthTransactionCookies';
import { safeRedirect } from '@/lib/safeRedirect';
import { extractCookieValue } from '@/lib/springCookie';
import { SpringEnvelopeSchema, SpringLoginUrlDataSchema } from '@/types/auth';

/**
 * 카카오/네이버 로그인 URL 발급 — 로그인 버튼 클릭 시 `useSocialLogin` 이 호출.
 * `redirectUri` 는 클라이언트 입력을 신뢰하지 않고 요청 origin 에서 서버가 직접 계산한다
 * (카카오/네이버 콘솔에 등록된 값과 일치해야 하며, `/callback/[provider]` 가 그 착지 지점).
 *
 * `returnTo` 는 클라이언트가 보낸 값을 그대로 Spring 에 전달하기 전에 다시 한번
 * `safeRedirect` 로 검증한다(FE-09, 방어적 이중 검증) — Spring 도 동일 규칙으로 검증하지만
 * 이 Route Handler 를 직접 두드리는 요청까지 신뢰할 이유는 없다.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;

  if (!isOAuthProvider(provider)) {
    return fail(400, '지원하지 않는 서비스 제공자입니다.');
  }

  const { returnTo } = (await req.json().catch(() => ({}))) as { returnTo?: string };
  const validatedReturnTo = returnTo ? safeRedirect(returnTo) : undefined;

  const redirectUri = new URL(`/callback/${provider}`, req.nextUrl.origin).toString();

  const springRes = await fetch(`${env.API_INTERNAL_URL}/api/v1/auth/oauth/${provider}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: provider.toUpperCase(),
      redirectUri,
      ...(validatedReturnTo ? { returnTo: validatedReturnTo } : {}),
    }),
  });

  const raw = SpringEnvelopeSchema(SpringLoginUrlDataSchema).parse(await springRes.json());

  if (raw.status === 'ERROR' || !raw.data) {
    return fail(springRes.status, raw.message);
  }

  // 콜백에서 Spring 검증에 그대로 되돌려줘야 하는 인가 트랜잭션 값 — Set-Cookie 에만 실려온다
  // (JSON 바디에는 없음). 하나라도 없으면 콜백이 반드시 실패하니 여기서 바로 막는다.
  const setCookieHeaders = springRes.headers.getSetCookie();
  const state = extractCookieValue(setCookieHeaders, 'oauth_state');
  const codeVerifier = extractCookieValue(setCookieHeaders, 'oauth_code_verifier');
  const redirectUriCookie = extractCookieValue(setCookieHeaders, 'oauth_redirect_uri');
  if (!state || !codeVerifier || !redirectUriCookie) {
    return fail(502, '로그인을 시작하지 못했어요. 잠시 후 다시 시도해주세요.');
  }

  const res = ok(raw.data);
  setOAuthTransactionCookies(res, { state, codeVerifier, redirectUri: redirectUriCookie });
  return res;
}
