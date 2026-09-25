'use client';

import { useQuery } from '@tanstack/react-query';

import { recipeKeys } from '@/hooks/recipe/queryKeys';
import { fetchMyRecipeRecommendations } from '@/lib/apiClient';
import type { MyRecipeRecommendationParams } from '@/types/recipe';

/**
 * My냉장고 기반 AI 추천 레시피 (api-convention §1·§4). AI 파트 RECO-02(개발완료).
 * 아직 어떤 화면도 소비하지 않는다 — `RecipeAiRecommendSection`이 필요로 하는
 * imageSrc/description/ingredients 상세는 이 응답에 없어(레시피 상세 RECIPE-01 필요)
 * 화면 연결은 후속 이슈에서 RECIPE-01과 함께 진행한다(types/recipe.ts 참고).
 */
export function useMyRecipeRecommendations(params: Partial<MyRecipeRecommendationParams> = {}) {
  return useQuery({
    queryKey: recipeKeys.recommendationList(params),
    queryFn: () => fetchMyRecipeRecommendations(params),
  });
}
