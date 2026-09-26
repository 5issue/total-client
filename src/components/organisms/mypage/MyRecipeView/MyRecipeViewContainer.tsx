'use client';

import { useQueries } from '@tanstack/react-query';

import { recipeKeys } from '@/hooks/recipe/queryKeys';
import { useMyRecipeRecommendations } from '@/hooks/recipe/useMyRecipeRecommendations';
import { fetchMissingProducts, fetchRecipeDetail } from '@/lib/apiClient';

import { toRecipeViewModel } from './mapRecipe';
import type { Recipe } from './model';
import { MyRecipeView } from './MyRecipeView';

/**
 * `MyRecipeView`(표현 컴포넌트) 컨테이너 — `useMyRecipeRecommendations`(RECO-02)로
 * 추천 목록을 받고, 카드에 필요한 이미지·설명·재료·가격은 그 응답에 없어 레시피별로
 * 상세(RECIPE-01)·부족재료(RECIPE-03)를 병렬 조회(`useQueries`)해 합성한다
 * (`mapRecipe.ts`). N+1 호출이지만 캐러셀 카드 수가 적어(`limit` 기본 10) 우선 이
 * 방식으로 간다 — 개별 카드 조회가 실패하면 그 카드만 조용히 목록에서 빠진다.
 */
export function MyRecipeViewContainer() {
  const recommendationsQuery = useMyRecipeRecommendations();
  const recommendedIds = recommendationsQuery.data?.items.map((item) => item.recipe_id) ?? [];

  const detailQueries = useQueries({
    queries: recommendedIds.map((recipeId) => ({
      queryKey: recipeKeys.detail(recipeId),
      queryFn: () => fetchRecipeDetail(recipeId),
    })),
  });
  const missingProductsQueries = useQueries({
    queries: recommendedIds.map((recipeId) => ({
      queryKey: recipeKeys.missingProducts(recipeId, {}),
      queryFn: () => fetchMissingProducts(recipeId),
    })),
  });

  const aiRecommendedRecipes: Recipe[] = [];
  recommendedIds.forEach((_recipeId, index) => {
    const detail = detailQueries[index];
    const missingProducts = missingProductsQueries[index];
    if (detail?.data && missingProducts?.data) {
      aiRecommendedRecipes.push(toRecipeViewModel(detail.data, missingProducts.data));
    }
  });

  const detailsPending =
    recommendedIds.length > 0 && detailQueries.some((query) => query.isPending);
  const missingProductsPending =
    recommendedIds.length > 0 && missingProductsQueries.some((query) => query.isPending);

  return (
    <MyRecipeView
      aiRecommendedRecipes={aiRecommendedRecipes}
      aiRecommendedPending={
        recommendationsQuery.isPending || detailsPending || missingProductsPending
      }
      aiRecommendedError={recommendationsQuery.isError}
    />
  );
}
