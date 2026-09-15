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
 * 임시(#86): 소셜 로그인이 배포 환경(Vercel Preview 등)에서 아직 엔드투엔드로 검증되지
 * 않아, 그 전까지 보호 라우트 가드를 전부 비활성화한다 — 리뷰어·팀원이 로그인 없이
 * `/checkout`, `/mypage/**` 화면을 볼 수 있어야 하기 때문. 배포 환경에서 소셜 로그인이
 * 실제로 동작하는 걸 확인하면 이 상수만 지우면 아래 원래 가드 로직이 그대로 복원된다.
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
