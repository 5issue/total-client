/** fridge 도메인 쿼리 키 팩토리 (api-convention §4). */
export const fridgeKeys = {
  all: ['fridge'] as const,
  lists: () => [...fridgeKeys.all, 'list'] as const,
};
