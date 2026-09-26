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

/**
 * 임시(#113 PR 리뷰): Vercel Preview 는 실제 백엔드 세션이 없어 `refresh_token` 쿠키가
 * 절대 안 생기므로, 가드가 켜져 있으면 리뷰어가 `/mypage/**` UI 자체를 볼 수 없다(항상
 * `/login` 으로 튕김) — 백엔드가 붙은 로컬/스테이징에서만 리뷰가 가능해지는 문제.
 * PR #113(#86 와 같은 패턴) 리뷰 기간에만 켜 두고, 리뷰 끝나면 이 상수만 지우면 아래
 * 원래 가드 로직이 그대로 복원된다.
 */
const ROUTE_GUARD_DISABLED = true;

export function middleware(req: NextRequest) {
  if (ROUTE_GUARD_DISABLED) {
    return NextResponse.next();
  }

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
