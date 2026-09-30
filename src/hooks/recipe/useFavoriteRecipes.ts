'use client';

import { useQuery } from '@tanstack/react-query';

import { recipeKeys } from '@/hooks/recipe/queryKeys';
import { fetchFavoriteRecipes } from '@/lib/apiClient';
import type { FavoriteRecipeListParams } from '@/types/recipe';

/** 찜한 레시피 목록 (api-convention §1·§4). AI 파트 FAV-01(구현됨, 이슈 #152). */
export function useFavoriteRecipes(params: Partial<FavoriteRecipeListParams> = {}) {
  return useQuery({
    queryKey: recipeKeys.favoriteList(params),
    queryFn: () => fetchFavoriteRecipes(params),
  });
}
