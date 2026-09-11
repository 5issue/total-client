import { NextResponse, type NextRequest } from 'next/server';

import { setRefreshTokenCookie } from '@/lib/authCookies';
import { isOAuthProvider } from '@/lib/constants';
import { env } from '@/lib/env';
import { safeRedirect } from '@/lib/safeRedirect';
import { extractRefreshTokenCookie } from '@/lib/springCookie';
import { SpringEnvelopeSchema, SpringOAuthCallbackDataSchema } from '@/types/auth';

/**
 * OAuth 콜백 — 카카오/네이버가 로그인 동의 후 브라우저를 이 경로로 리다이렉트한다
 * (GET, `?code=&state=`). Spring 콜백 엔드포인트에 서버사이드로 code/state 를 넘겨
 * 세션을 발급받고, 우리 자신의 `refresh_token` 쿠키를 새로 구운 뒤 302 리다이렉트한다.
 *
 * accessToken(JSON body)은 여기서 브라우저로 옮기지 않는다 — 메모리 전용 저장(FE-05,
 * `useAuthTokenStore`)이라 리다이렉트만으로는 전달할 수단이 없다. 착지 페이지가 로드되면
 * `/api/auth/refresh`(이미 있는 refresh_token 쿠키 이용)를 한 번 호출해 accessToken 을
 * 메모리에 채우는 "앱 부팅 시 무음 재발급" 배선이 별도로 필요하다 — 로그인 페이지 UI 작업에서 연결.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const redirectTarget = safeRedirect(req.nextUrl.searchParams.get('redirect'));

  if (!isOAuthProvider(provider) || !code || !state) {
    return NextResponse.redirect(new URL('/login?error=invalid_request', req.nextUrl.origin));
  }

  const springRes = await fetch(`${env.API_INTERNAL_URL}/api/v1/auth/oauth/${provider}/callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, state }),
  });

  const raw = SpringEnvelopeSchema(SpringOAuthCallbackDataSchema).parse(await springRes.json());

  if (raw.status === 'ERROR' || !raw.data) {
    return NextResponse.redirect(new URL('/login?error=oauth_failed', req.nextUrl.origin));
  }

  // 성공 응답인데 Set-Cookie 에서 refresh_token 을 못 뽑으면(형식 변경 등) 쿠키 없이
  // 조용히 홈으로 보내면 안 된다 — 로그인 안 된 채로 도착하는 게 더 혼란스럽다.
  const rotated = extractRefreshTokenCookie(springRes.headers.getSetCookie());
  if (!rotated) {
    return NextResponse.redirect(new URL('/login?error=oauth_failed', req.nextUrl.origin));
  }

  const redirectRes = NextResponse.redirect(new URL(redirectTarget, req.nextUrl.origin));
  setRefreshTokenCookie(redirectRes, rotated.value, rotated.maxAge);

  return redirectRes;
}
