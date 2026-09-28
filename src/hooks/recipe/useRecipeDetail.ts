'use client';

import { useQuery } from '@tanstack/react-query';

import { recipeKeys } from '@/hooks/recipe/queryKeys';
import { fetchRecipeDetail } from '@/lib/apiClient';

/** 레시피 상세 조회 (api-convention §1·§4). AI 파트 RECIPE-01. `recipeId` 없으면 호출하지 않는다. */
export function useRecipeDetail(recipeId: string) {
  return useQuery({
    queryKey: recipeKeys.detail(recipeId),
    queryFn: () => fetchRecipeDetail(recipeId),
    enabled: recipeId.length > 0,
  });
}
