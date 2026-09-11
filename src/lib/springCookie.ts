/**
 * Spring 이 내려준 `refresh_token` Set-Cookie 원본에서 값·Max-Age 만 추출한다.
 *
 * Spring 의 쿠키는 `Path=/v1/auth/refresh` 로 스코프돼 있어 우리 사이트 경로 구조와 맞지 않고,
 * 애초에 브라우저는 Spring 과 직접 통신하지 않으므로(api-convention §3) 이 헤더는 우리
 * Route Handler 만 수신한다 — 값만 뽑아 우리 자신의 쿠키로 재발급한다(`authCookies.ts`, FE-05).
 */
export type ExtractedRefreshToken = { value: string; maxAge: number };

/** 스펙 기본값(14일, 1209600초) — Set-Cookie 에 Max-Age 가 없을 때만 fallback. */
const DEFAULT_MAX_AGE = 1209600;

export function extractRefreshTokenCookie(
  setCookieHeaders: string[],
): ExtractedRefreshToken | null {
  for (const header of setCookieHeaders) {
    const valueMatch = /(?:^|;\s*)refresh_token=([^;]+)/.exec(header);
    if (!valueMatch) continue;
    const maxAgeMatch = /;\s*Max-Age=(\d+)/i.exec(header);
    return {
      value: decodeURIComponent(valueMatch[1] ?? ''),
      maxAge: maxAgeMatch?.[1] ? Number(maxAgeMatch[1]) : DEFAULT_MAX_AGE,
    };
  }
  return null;
}
