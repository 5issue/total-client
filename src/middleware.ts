import { type NextRequest, NextResponse } from 'next/server';

/**
 * 보호 경로(/checkout, /mypage 하위) 가드.
 * `refresh_token` 쿠키가 없으면 `/login?redirect=<원래 목적지>` 로 이동시킨다.
 *
 * 쿠키 "유무"만 보는 낙관적(UX) 검사다 — 실제 인가는 서버(Route Handler / 외부 API)가
 * 매 요청 검증하고, 만료·위조된 쿠키는 착지 후 첫 `privateFetch` 401 → refresh 실패 시
 * `/api/auth/refresh` 가 쿠키를 정리한다 (security-convention FE-15).
 */
const REFRESH_TOKEN_COOKIE = 'refresh_token';

export function middleware(req: NextRequest) {
  if (req.cookies.get(REFRESH_TOKEN_COOKIE)?.value) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/login', req.nextUrl.origin);
  loginUrl.searchParams.set('redirect', req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/checkout/:path*', '/mypage/:path*'],
};
