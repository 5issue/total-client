import { type NextRequest, NextResponse } from 'next/server';

/**
 * 보호 경로 가드. `refresh_token` 쿠키가 없으면 `/login?redirect=<원래 목적지>` 로 보낸다.
 * 대상: `/checkout` 전체와 마이컬리(`/mypage` 하위 전부 — 랜딩 포함, 로그아웃 시 마이컬리는 로그인 화면).
 *
 * 쿠키 "유무"만 보는 낙관적(UX) 검사다 — 실제 인가는 서버가 매 요청 검증하고, 만료·위조된
 * 쿠키는 착지 후 첫 `privateFetch` 401 → refresh 실패 시 `/api/auth/refresh` 가 정리한다
 * (security-convention FE-15).
 */
const REFRESH_TOKEN_COOKIE = 'refresh_token';

export function middleware(req: NextRequest) {
  if (req.cookies.get(REFRESH_TOKEN_COOKIE)?.value) {
    return NextResponse.next();
  }

  const url = new URL('/login', req.nextUrl.origin);
  url.searchParams.set('redirect', req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/checkout/:path*', '/mypage/:path*'],
};
