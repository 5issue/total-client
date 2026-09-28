/** address 도메인 쿼리 키 팩토리 (api-convention §4). */
export const addressKeys = {
  all: ['address'] as const,
  list: () => [...addressKeys.all, 'list'] as const,
};
