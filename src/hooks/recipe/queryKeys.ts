import type {
  FavoriteRecipeListParams,
  MissingProductsParams,
  MyRecipeRecommendationParams,
  RecentRecipeListParams,
} from '@/types/recipe';

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
  favorites: () => [...recipeKeys.all, 'favorite'] as const,
  favoriteList: (params: Partial<FavoriteRecipeListParams>) =>
    [...recipeKeys.favorites(), params] as const,
  recents: () => [...recipeKeys.all, 'recent'] as const,
  recentList: (params: Partial<RecentRecipeListParams>) =>
    [...recipeKeys.recents(), params] as const,
};
