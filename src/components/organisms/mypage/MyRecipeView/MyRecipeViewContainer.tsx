'use client';

import { useQueries } from '@tanstack/react-query';

import { recipeKeys } from '@/hooks/recipe/queryKeys';
import { useAddFavoriteRecipe } from '@/hooks/recipe/useAddFavoriteRecipe';
import { useFavoriteRecipes } from '@/hooks/recipe/useFavoriteRecipes';
import { useMyRecipeRecommendations } from '@/hooks/recipe/useMyRecipeRecommendations';
import { useRemoveFavoriteRecipe } from '@/hooks/recipe/useRemoveFavoriteRecipe';
import { fetchMissingProducts, fetchRecipeDetail } from '@/lib/apiClient';

import { toRecipeViewModel } from './mapRecipe';
import type { Recipe, RecipeCardSummary } from './model';
import { toCardSummary } from './model';
import { MyRecipeView } from './MyRecipeView';

const LIKED_PREVIEW_LIMIT = 10;

/**
 * `MyRecipeView`(표현 컴포넌트) 컨테이너 — `useMyRecipeRecommendations`(RECO-02)로
 * 추천 목록을 받고, 카드에 필요한 이미지·설명·재료·가격은 그 응답에 없어 레시피별로
 * 상세(RECIPE-01)·부족재료(RECIPE-03)를 병렬 조회(`useQueries`)해 합성한다
 * (`mapRecipe.ts`). N+1 호출이지만 캐러셀 카드 수가 적어(`limit` 기본 10) 우선 이
 * 방식으로 간다 — 개별 카드 조회가 실패하면 그 카드만 조용히 목록에서 빠진다.
 *
 * "찜한 레시피" 섹션(`RecipeCardM`)도 보유/필요 재료 개수를 표시해서, AI 추천과
 * 동일하게 `useFavoriteRecipes`(FAV-01, 이슈 #152)가 준 `recipe_id`마다 상세·
 * 부족재료를 추가 조회해 합성한다(`LikedRecipesViewContainer`와 동일 패턴) — 화면당
 * 요청이 늘지만(최대 20개) 실제 개수를 보여주는 쪽을 택했다. "최근 본"은 대응
 * 엔드포인트가 아직 안 붙어 mock 유지.
 *
 * AI 추천 카드의 하트도 같은 `useFavoriteRecipes` 응답으로 찜 여부를 판단한다 —
 * RECO-02(추천) 응답 자체엔 찜 여부가 없어 `toRecipeViewModel`이 `liked: false`로
 * 고정하므로, 여기서 찜 목록의 `recipe_id` 집합과 대조해 덮어쓴다. 찜 추가/해제는
 * `LikedRecipesViewContainer`와 동일하게 `useFavoriteRecipes` 캐시를 무효화해
 * 두 섹션이 함께 갱신된다.
 */
export function MyRecipeViewContainer() {
  const recommendationsQuery = useMyRecipeRecommendations();
  const recommendedIds = recommendationsQuery.data?.items.map((item) => item.recipe_id) ?? [];
  const favoritesQuery = useFavoriteRecipes({ limit: LIKED_PREVIEW_LIMIT });
  const favoriteIds = favoritesQuery.data?.items.map((item) => item.recipe_id) ?? [];
  const likedIds = new Set(favoriteIds);
  const addFavorite = useAddFavoriteRecipe();
  const removeFavorite = useRemoveFavoriteRecipe();

  const allRecipeIds = [...recommendedIds, ...favoriteIds];
  const detailQueries = useQueries({
    queries: allRecipeIds.map((recipeId) => ({
      queryKey: recipeKeys.detail(recipeId),
      queryFn: () => fetchRecipeDetail(recipeId),
    })),
  });
  const missingProductsQueries = useQueries({
    queries: allRecipeIds.map((recipeId) => ({
      queryKey: recipeKeys.missingProducts(recipeId, {}),
      queryFn: () => fetchMissingProducts(recipeId),
    })),
  });

  const aiRecommendedRecipes: Recipe[] = [];
  recommendedIds.forEach((recipeId, index) => {
    const detail = detailQueries[index];
    const missingProducts = missingProductsQueries[index];
    if (detail?.data && missingProducts?.data) {
      aiRecommendedRecipes.push({
        ...toRecipeViewModel(detail.data, missingProducts.data),
        liked: likedIds.has(recipeId),
      });
    }
  });

  const likedRecipes: RecipeCardSummary[] = [];
  favoriteIds.forEach((recipeId, favoriteIndex) => {
    const index = recommendedIds.length + favoriteIndex;
    const detail = detailQueries[index];
    const missingProducts = missingProductsQueries[index];
    if (detail?.data && missingProducts?.data) {
      likedRecipes.push(toCardSummary(toRecipeViewModel(detail.data, missingProducts.data)));
    }
  });

  // AI 추천 섹션 로딩 상태는 그 섹션 몫의 조회(앞 recommendedIds.length개)만 본다 —
  // 안 그러면 찜 목록 조회가 늦을 때 AI 추천 섹션까지 같이 로딩으로 보인다.
  const aiDetailQueries = detailQueries.slice(0, recommendedIds.length);
  const aiMissingProductsQueries = missingProductsQueries.slice(0, recommendedIds.length);
  const detailsPending =
    recommendedIds.length > 0 && aiDetailQueries.some((query) => query.isPending);
  const missingProductsPending =
    recommendedIds.length > 0 && aiMissingProductsQueries.some((query) => query.isPending);

  function handleToggleLike(id: string, liked: boolean) {
    if (addFavorite.isPending || removeFavorite.isPending) return;
    if (liked) {
      addFavorite.mutate(id);
    } else {
      removeFavorite.mutate(id);
    }
  }

  return (
    <MyRecipeView
      aiRecommendedRecipes={aiRecommendedRecipes}
      aiRecommendedPending={
        recommendationsQuery.isPending || detailsPending || missingProductsPending
      }
      aiRecommendedError={recommendationsQuery.isError}
      onToggleAiRecommendedLike={handleToggleLike}
      likedRecipes={likedRecipes}
    />
  );
}
