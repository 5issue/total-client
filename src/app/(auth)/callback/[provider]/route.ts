import { NextResponse, type NextRequest } from 'next/server';

import { setRefreshTokenCookie } from '@/lib/authCookies';
import { isOAuthProvider } from '@/lib/constants';
import { env } from '@/lib/env';
import {
  buildOAuthTransactionCookieHeader,
  clearOAuthTransactionCookies,
} from '@/lib/oauthTransactionCookies';
import { safeRedirect } from '@/lib/safeRedirect';
import { extractRefreshTokenCookie } from '@/lib/springCookie';

const LOGIN_RESULT_PARAM = 'login';
const LOGIN_RESULT_SUCCESS = 'success';
const RETURN_TO_PARAM = 'returnTo';

/**
 * OAuth 콜백 — 카카오/네이버가 로그인 동의 후 브라우저를 이 경로로 리다이렉트한다
 * (GET, `?code=&state=`). Spring 콜백 엔드포인트(`GET .../callback?code=&state=`)에
 * 서버사이드로 그대로 넘기되, 로그인 URL 발급 때 심어둔 인가 트랜잭션 쿠키(`oauth_state` 등)를
 * `Cookie` 헤더로 함께 실어 보낸다 — Spring 의 인가 코드 가로채기 방지 검증이 그 쿠키를 읽는다
 * (`oauthTransactionCookies.ts`).
 *
 * Spring 은 이 호출에 JSON이 아니라 **302 리다이렉트**로 응답한다
 * (`Location: <frontend-redirect-uri>?login=success|failed[&returnTo=...]`,
 * 성공 시 `Set-Cookie: refresh_token=...`도 함께 내려온다). `redirect: 'manual'`로 자동
 * 추적을 막고 그 `Location`을 직접 해석해야 한다 — 그냥 따라가면 최종 페이지의 HTML을
 * JSON으로 파싱하려다 깨진다.
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

  // 로그인 URL 발급 때 심어둔 인가 트랜잭션 쿠키 — Spring 의 인가 코드 가로채기 방지 검증에 필요.
  // 없으면(만료·직접 접근 등) code/state 가 있어도 콜백을 시도할 수 없다.
  const transactionCookieHeader = buildOAuthTransactionCookieHeader(req);

  if (!isOAuthProvider(provider) || !code || !state || !transactionCookieHeader) {
    return NextResponse.redirect(new URL('/login?error=invalid_request', req.nextUrl.origin));
  }

  const callbackUrl = new URL(`/api/v1/auth/oauth/${provider}/callback`, env.API_INTERNAL_URL);
  callbackUrl.searchParams.set('code', code);
  callbackUrl.searchParams.set('state', state);

  const springRes = await fetch(callbackUrl, {
    method: 'GET',
    headers: { Cookie: transactionCookieHeader },
    redirect: 'manual',
  });

  const location = springRes.headers.get('location');
  const loginResult = location ? new URL(location).searchParams.get(LOGIN_RESULT_PARAM) : null;

  if (loginResult !== LOGIN_RESULT_SUCCESS) {
    const failRes = NextResponse.redirect(new URL('/login?error=oauth_failed', req.nextUrl.origin));
    clearOAuthTransactionCookies(failRes);
    return failRes;
  }

  // 성공 응답인데 Set-Cookie 에서 refresh_token 을 못 뽑으면(형식 변경 등) 쿠키 없이
  // 조용히 홈으로 보내면 안 된다 — 로그인 안 된 채로 도착하는 게 더 혼란스럽다.
  const rotated = extractRefreshTokenCookie(springRes.headers.getSetCookie());
  if (!rotated) {
    const failRes = NextResponse.redirect(new URL('/login?error=oauth_failed', req.nextUrl.origin));
    clearOAuthTransactionCookies(failRes);
    return failRes;
  }

  // Spring 이 돌려준 returnTo 는 이미 내부 상대경로로 검증된 값이지만, 우리 자신의
  // 리다이렉트에 쓰기 전에 safeRedirect 를 한 번 더 통과시킨다(FE-09, 방어적 이중 검증).
  const returnTo = new URL(location!).searchParams.get(RETURN_TO_PARAM);
  const finalTarget = returnTo ? safeRedirect(returnTo) : redirectTarget;

  const redirectRes = NextResponse.redirect(new URL(finalTarget, req.nextUrl.origin));
  setRefreshTokenCookie(redirectRes, rotated.value, rotated.maxAge);
  clearOAuthTransactionCookies(redirectRes);

  return redirectRes;
}
