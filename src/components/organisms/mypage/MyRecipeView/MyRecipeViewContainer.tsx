'use client';

import { useQueries } from '@tanstack/react-query';

import { recipeKeys } from '@/hooks/recipe/queryKeys';
import { useMyRecipeRecommendations } from '@/hooks/recipe/useMyRecipeRecommendations';
import { fetchMissingProducts, fetchRecipeDetail } from '@/lib/apiClient';

import { toRecipeViewModel } from './mapRecipe';
import type { Recipe } from './model';
import { MyRecipeView } from './MyRecipeView';

/**
 * `MyRecipeView`(표현 컴포넌트) 컨테이너 — `useMyRecipeRecommendations`(AI 파트
 * RECO-02)로 추천 목록을 받고, 카드 렌더에 필요한 콘텐츠(이미지·설명·재료·가격)는
 * 추천 응답에 없어 레시피별로 상세(RECIPE-01)·부족재료(RECIPE-03)를 추가 조회해
 * 합성한다(이슈 #140, `mapRecipe.ts` 참고).
 *
 * 레시피 개수만큼 상세·부족재료를 병렬 조회(`useQueries`)한다 — N+1 호출이지만
 * 캐러셀이 한 번에 보여주는 카드 수가 적어(추천 `limit` 기본 10) 우선 이 방식으로
 * 가고, 느리면 AI팀에 배치 조회를 요청한다. 개별 카드의 상세·부족재료 조회가
 * 실패하면 그 카드만 조용히 목록에서 빠진다(전체 캐러셀을 에러로 막지 않는다).
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
