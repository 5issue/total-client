import type { MissingProductsParams, MyRecipeRecommendationParams } from '@/types/recipe';

/** recipe 도메인 쿼리 키 팩토리 (api-convention §4). */
export const recipeKeys = {
  all: ['recipe'] as const,
  recommendations: () => [...recipeKeys.all, 'recommendation'] as const,
  recommendationList: (params: Partial<MyRecipeRecommendationParams>) =>
    [...recipeKeys.recommendations(), params] as const,
  details: () => [...recipeKeys.all, 'detail'] as const,
  detail: (recipeId: string) => [...recipeKeys.details(), recipeId] as const,
  missingProductsLists: () => [...recipeKeys.all, 'missingProducts'] as const,
  missingProducts: (recipeId: string, params: Partial<MissingProductsParams>) =>
    [...recipeKeys.missingProductsLists(), recipeId, params] as const,
};
