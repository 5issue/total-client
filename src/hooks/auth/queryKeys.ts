/** auth 도메인 쿼리 키 팩토리 (api-convention §4). */
export const authKeys = {
  all: ['auth'] as const,
  /** 앱 부팅 시 무음 재발급 결과(세션 유무). */
  session: ['auth', 'session'] as const,
};
