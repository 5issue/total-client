import type { NextRequest } from 'next/server';

import { env } from '@/lib/env';

/**
 * 쿠키 기반 인증 상태변경 요청(POST/PUT/PATCH/DELETE)의 CSRF 2차 방어.
 * `Origin`(없으면 `Referer`)이 이 요청이 실제로 도착한 오리진과 다르면 거부한다.
 * (security-convention FE-06, 1차 방어는 refresh_token 쿠키의 SameSite)
 *
 * "이 요청이 실제로 도착한 오리진"을 `req.nextUrl.origin`으로 직접 계산하지 않는다 —
 * 배포 환경은 CDN/프록시(CloudFront) 뒤에서 원본 Host 헤더가 안 넘어오면 이 값이
 * 컨테이너 자체 bind 주소 등으로 resolve된다(OAuth 로그인 시작 #150, 콜백 #156,
 * 보호 라우트 가드(middleware.ts)와 동일 원인 — 실제로 이 함수 때문에 배포에서
 * 장바구니 담기·배송지 등록·주문 등 상태변경 요청이 전부 403으로 막히는 게 확인됨,
 * 2026-09-30). `NEXT_PUBLIC_APP_URL`(배포 공개 도메인)이 있으면 그걸 기준으로 삼고,
 * 없으면(로컬 등) 기존처럼 `req.nextUrl.origin`으로 폴백한다.
 */
export function isSameOrigin(req: NextRequest): boolean {
  const expectedOrigin = env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

  const origin = req.headers.get('origin');
  if (origin) {
    return origin === expectedOrigin;
  }

  // 일부 오래된 브라우저/요청은 Origin 대신 Referer만 보낸다.
  const referer = req.headers.get('referer');
  if (referer) {
    try {
      return new URL(referer).origin === expectedOrigin;
    } catch {
      return false;
    }
  }

  // 브라우저의 상태변경 fetch 는 Origin/Referer 중 하나를 항상 보낸다 — 둘 다 없으면 차단.
  return false;
}
