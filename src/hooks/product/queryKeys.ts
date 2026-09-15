import type { ProductListParams } from '@/types/product';

/** product 도메인 쿼리 키 팩토리 (api-convention §4). */
export const productKeys = {
  all: ['product'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductListParams) => [...productKeys.lists(), params] as const,
};
