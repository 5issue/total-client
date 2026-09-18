/** cart 도메인 쿼리 키 팩토리 (api-convention §4). */
export const cartKeys = {
  all: ['cart'] as const,
  detail: () => [...cartKeys.all, 'detail'] as const,
};
