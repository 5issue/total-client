/**
 * next.config.ts `images.remotePatterns` 화이트리스트와 짝을 이루는 런타임 검증판.
 *
 * AI 파트 레시피 상세(RECIPE-01) `image_url` 은 자체 CDN이 아니라 크롤링한 외부
 * 레시피 사이트 이미지를 그대로 반환한다 — 식품안전나라 하나로 끝나는 게 아니라
 * (예: allrecipes.com, 2026-09-30 실제 재현) 언제든 새 도메인이 섞여 들어올 수 있다.
 * 화이트리스트에 없는 호스트를 next/image 에 그대로 넘기면 "Invalid src prop" 런타임
 * 에러로 화면 전체가 깨지므로, 여기서 먼저 걸러 placeholder 로 대체한다.
 *
 * next.config.ts 가 이 배열을 그대로 `remotePatterns` 에 쓰므로 두 목록은 항상 같다.
 */
export const REMOTE_IMAGE_PATTERNS = [
  {
    protocol: 'http',
    hostname: 'www.foodsafetykorea.go.kr',
    pathname: '/uploadimg/**',
  },
  {
    protocol: 'https',
    hostname: 'img-cf.kurly.com',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'product-image.kurly.com',
    pathname: '/**',
  },
] as const;

/** remotePatterns의 `pathname`(`/uploadimg/**`, `/**` 등)과 같은 글롭 문법으로 매칭한다 —
 *  `*`는 세그먼트 하나, `**`는 몇 단계든. (Next.js `images.remotePatterns` 문법과 동일.) */
function matchesPathname(pattern: string, pathname: string): boolean {
  const regexSource = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*+/g, (run) => (run.length >= 2 ? '.*' : '[^/]*'));
  return new RegExp(`^${regexSource}$`).test(pathname);
}

/** `next/image` 에 그대로 넘겨도 안전한 src 인지(로컬 경로거나 화이트리스트 호스트+경로). */
export function isAllowedImageSrc(src: string | null | undefined): src is string {
  if (!src) return false;
  // `//example.com/...` 같은 프로토콜 상대 URL은 로컬 경로가 아니다 — 로컬 경로
  // 체크보다 먼저 걸러야 한다(Next.js 기본 이미지 로더도 이 형태를 거부한다).
  if (src.startsWith('//')) return false;
  if (src.startsWith('/')) return true;
  try {
    const url = new URL(src);
    return REMOTE_IMAGE_PATTERNS.some(
      (pattern) =>
        pattern.protocol === url.protocol.replace(':', '') &&
        pattern.hostname === url.hostname &&
        matchesPathname(pattern.pathname, url.pathname),
    );
  } catch {
    return false;
  }
}
