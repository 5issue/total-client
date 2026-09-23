import type { NextRequest } from 'next/server';

/**
 * 쿠키 기반 인증 상태변경 요청(POST/PUT/PATCH/DELETE)의 CSRF 2차 방어.
 * `Origin`(없으면 `Referer`)이 이 요청이 실제로 도착한 오리진과 다르면 거부한다.
 * (security-convention FE-06, 1차 방어는 refresh_token 쿠키의 SameSite)
 */
export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (origin) {
    return origin === req.nextUrl.origin;
  }

  // 일부 오래된 브라우저/요청은 Origin 대신 Referer만 보낸다.
  const referer = req.headers.get('referer');
  if (referer) {
    try {
      return new URL(referer).origin === req.nextUrl.origin;
    } catch {
      return false;
    }
  }

  // 브라우저의 상태변경 fetch 는 Origin/Referer 중 하나를 항상 보낸다 — 둘 다 없으면 차단.
  return false;
}
