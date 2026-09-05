/**
 * 오픈 리다이렉트 방지 (security-convention FE-09).
 * 로그인 후 복귀(`?redirect=`) 등에서 오직 자사 상대경로만 허용한다.
 * 절대 URL, 프로토콜 상대(`//evil.com`), `\` 우회를 모두 차단하고 `/` 로 되돌린다.
 */
export function safeRedirect(target: string | null): string {
  if (!target) return '/';
  if (!target.startsWith('/') || target.startsWith('//') || target.includes('\\')) return '/';
  return target;
}
