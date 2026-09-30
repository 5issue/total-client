'use client';

import { useQuery } from '@tanstack/react-query';

import { recipeKeys } from '@/hooks/recipe/queryKeys';
import { fetchRecentRecipes } from '@/lib/apiClient';
import type { RecentRecipeListParams } from '@/types/recipe';

/** 최근 본 레시피 목록 (api-convention §1·§4). AI 파트 RECENT-01(구현됨, 이슈 #153). */
export function useRecentRecipes(params: Partial<RecentRecipeListParams> = {}) {
  return useQuery({
    queryKey: recipeKeys.recentList(params),
    queryFn: () => fetchRecentRecipes(params),
  });
}
