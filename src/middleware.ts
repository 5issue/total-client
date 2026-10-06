import { type NextRequest, NextResponse } from 'next/server';

import { env } from '@/lib/env';

/**
 * 보호 경로 가드. `refresh_token` 쿠키가 없으면 `/login?redirect=<원래 목적지>` 로 보낸다.
 * 대상: `/login` 을 제외한 모든 페이지(2026-09-29, 이전엔 `/checkout`·`/mypage` 만이었으나
 * 범위를 확대) — #113 PR 리뷰 기간에 껐던 걸 다시 켰다(당시 임시 우회 상수는 제거).
 *
 * `/callback/[provider]`(OAuth 콜백)는 반드시 예외여야 한다 — 로그인 자체가 이 경로를
 * 거쳐 `refresh_token` 쿠키를 심는데, 여기까지 가드에 걸리면 로그인을 영영 끝낼 수 없다.
 * `/api/**` 도 예외 — Route Handler 는 이미 자체적으로 쿠키/Authorization 헤더로 인가를
 * 검증하고(api-convention), HTML 리다이렉트가 아니라 JSON 오류를 돌려줘야 한다.
 *
 * 쿠키 "유무"만 보는 낙관적(UX) 검사다 — 실제 인가는 서버가 매 요청 검증하고, 만료·위조된
 * 쿠키는 착지 후 첫 `privateFetch` 401 → refresh 실패 시 `/api/auth/refresh` 가 정리한다
 * (security-convention FE-15).
 *
 * 리다이렉트 대상 origin 은 `req.nextUrl.origin` 을 바로 쓰지 않는다 — 배포 환경은
 * 프록시/CDN 뒤에서 원본 Host 헤더가 안 넘어오면 이 값이 컨테이너 자체 bind 주소로
 * resolve 된다(OAuth 로그인 시작 #150, 콜백 #156 과 동일 원인). `NEXT_PUBLIC_APP_URL`
 * (배포 공개 도메인)이 있으면 그걸 우선하고, 없으면(로컬 개발 등) 기존 계산으로 폴백한다.
 */
const REFRESH_TOKEN_COOKIE = 'refresh_token';

export function middleware(req: NextRequest) {
  if (req.cookies.get(REFRESH_TOKEN_COOKIE)?.value) {
    return NextResponse.next();
  }

  const origin = env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const url = new URL('/login', origin);
  url.searchParams.set('redirect', req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // "/login" 자체, "/callback/[provider]"(OAuth 콜백), "/api/**", Next 정적 자산
    // (`_next/static`·`_next/image`), PWA 서빙 경로(`serwist`·`manifest.webmanifest`),
    // 그리고 확장자로 끝나는 정적 파일(`favicon.ico`, `/icon-192.png` 등 — next/image
    // 최적화 요청까지 걸려 "not a valid image" 400이 나던 문제, 기존 가드에서도 있던
    // 제외 규칙)을 뺀 나머지 전부.
    '/((?!login$|callback|api|_next/static|_next/image|serwist|manifest\\.webmanifest|.*\\.[a-zA-Z0-9]+$).*)',
  ],
};
