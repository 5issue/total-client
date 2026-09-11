import { HttpResponse, http } from 'msw';

/**
 * Spring 백엔드가 아직 배포 전이라 스펙 그대로의 성공/실패 응답을 목킹한다.
 * `API_INTERNAL_URL` 을 기준으로 매칭 — 우리 Route Handler 가 서버사이드로 호출하는
 * 바로 그 요청을 가로챈다(브라우저는 이 경로를 직접 안 부름, api-convention §3).
 */
const BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

function nowIso() {
  return new Date().toISOString();
}

export const authHandlers = [
  // POST /api/v1/auth/oauth/{provider} — 로그인 URL 발급
  http.post(`${BASE}/api/v1/auth/oauth/:provider`, ({ params }) => {
    const provider = String(params.provider).toUpperCase();

    if (provider !== 'KAKAO' && provider !== 'NAVER') {
      return HttpResponse.json(
        {
          status: 'ERROR',
          message: '지원하지 않는 서비스 제공자입니다.',
          data: null,
          error: 'Invalid Provider',
          timestamp: nowIso(),
        },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      status: 'SUCCESS',
      message: '소셜 로그인 URL',
      data: {
        loginUrl: `https://mock-oauth.example.com/${provider.toLowerCase()}/authorize`,
        provider,
      },
      error: null,
      timestamp: nowIso(),
    });
  }),

  // POST /api/v1/auth/oauth/{provider}/callback — 인가 코드 교환
  http.post(`${BASE}/api/v1/auth/oauth/:provider/callback`, async ({ request }) => {
    const body = (await request.json()) as { code?: string; state?: string };

    if (!body.code || !body.state) {
      return HttpResponse.json(
        {
          status: 'ERROR',
          message: '유효하지 않은 인가코드입니다.',
          data: null,
          error: 'INVALID_AUTH_CODE',
          timestamp: nowIso(),
        },
        { status: 400 },
      );
    }

    return HttpResponse.json(
      {
        status: 'SUCCESS',
        message: '소셜 로그인이 완료되었습니다.',
        data: {
          accessToken: 'mock-access-token',
          expiresIn: 3600,
          user: { userId: 1234, name: '홍길동', profileImageUrl: null },
        },
        error: null,
        timestamp: nowIso(),
      },
      {
        headers: {
          'Set-Cookie':
            'refresh_token=mock-refresh-token; Path=/v1/auth/refresh; HttpOnly; Secure; SameSite=Strict; Max-Age=1209600',
        },
      },
    );
  }),

  // POST /api/v1/auth/refresh — 토큰 재발급
  http.post(`${BASE}/api/v1/auth/refresh`, ({ cookies }) => {
    if (!cookies.refresh_token) {
      return HttpResponse.json(
        {
          status: 'ERROR',
          message: '유효하지 않거나 만료된 리프레시 토큰입니다. 다시 로그인해주세요.',
          data: null,
          error: 'INVALID_REFRESH_TOKEN',
          timestamp: nowIso(),
        },
        { status: 401 },
      );
    }

    return HttpResponse.json(
      {
        status: 'SUCCESS',
        message: '토큰이 성공적으로 재발급되었습니다.',
        data: { accessToken: 'mock-access-token-rotated', expiresIn: 1800 },
        error: null,
        timestamp: nowIso(),
      },
      {
        headers: {
          'Set-Cookie':
            'refresh_token=mock-refresh-token-rotated; Path=/v1/auth/refresh; HttpOnly; Secure; SameSite=Strict; Max-Age=1209600',
        },
      },
    );
  }),
];
