import type { MyRecipeRecommendationParams } from '@/types/recipe';

/** recipe 도메인 쿼리 키 팩토리 (api-convention §4). */
export const recipeKeys = {
  all: ['recipe'] as const,
  recommendations: () => [...recipeKeys.all, 'recommendation'] as const,
  recommendationList: (params: Partial<MyRecipeRecommendationParams>) =>
    [...recipeKeys.recommendations(), params] as const,
};
