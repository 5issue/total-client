'use client';

import { useQuery } from '@tanstack/react-query';

import { recipeKeys } from '@/hooks/recipe/queryKeys';
import { fetchMissingProducts } from '@/lib/apiClient';
import type { MissingProductsParams } from '@/types/recipe';

/** 부족 재료 상품 추천 조회 (api-convention §1·§4). AI 파트 RECIPE-03. */
export function useMissingProducts(recipeId: string, params: Partial<MissingProductsParams> = {}) {
  return useQuery({
    queryKey: recipeKeys.missingProducts(recipeId, params),
    queryFn: () => fetchMissingProducts(recipeId, params),
    enabled: recipeId.length > 0,
  });
}
