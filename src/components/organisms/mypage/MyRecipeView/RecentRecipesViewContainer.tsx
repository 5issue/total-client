'use client';

import { useQueries } from '@tanstack/react-query';

import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Icon } from '@/components/atoms/Icon';
import { LoadingIndicator } from '@/components/atoms/LoadingIndicator';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { recipeKeys } from '@/hooks/recipe/queryKeys';
import { useAddFavoriteRecipe } from '@/hooks/recipe/useAddFavoriteRecipe';
import { useFavoriteRecipes } from '@/hooks/recipe/useFavoriteRecipes';
import { useRecentRecipes } from '@/hooks/recipe/useRecentRecipes';
import { useRemoveFavoriteRecipe } from '@/hooks/recipe/useRemoveFavoriteRecipe';
import { fetchMissingProducts, fetchRecipeDetail } from '@/lib/apiClient';

import { toRecipeViewModel } from './mapRecipe';
import type { RecipeCardSummary } from './model';
import { toCardSummary } from './model';
import { RecentRecipesView } from './RecentRecipesView';

const RECENT_LIST_LIMIT = 50;
const FAVORITE_LIST_LIMIT = 100;

/**
 * `RecentRecipesView`(표현 컴포넌트) 컨테이너 — `useRecentRecipes`(AI 파트 RECENT-01,
 * 이슈 #153)로 최근 본 recipe_id 목록을 받는다. 카드에 필요한 이미지·보유/필요 재료
 * 개수는 그 응답에 없어, `LikedRecipesViewContainer`와 동일하게 레시피별 상세
 * (RECIPE-01)·부족재료(RECIPE-03)를 병렬 조회(`useQueries`)해 합성한다 — 개별 카드
 * 조회가 실패하면 그 카드만 조용히 목록에서 빠진다.
 *
 * 하트는 "최근 봄"과 무관한 별도 상태(찜)라 `useFavoriteRecipes` 목록과 대조해
 * `liked` 를 판정한다 — 찜 추가/해제는 `LikedRecipesViewContainer`와 동일하게
 * FAV-02/03 뮤테이션을 쓰고, 최근 본 목록 자체는 건드리지 않는다.
 */
export function RecentRecipesViewContainer() {
  const recentQuery = useRecentRecipes({ limit: RECENT_LIST_LIMIT });
  const favoritesQuery = useFavoriteRecipes({ limit: FAVORITE_LIST_LIMIT });
  const addFavorite = useAddFavoriteRecipe();
  const removeFavorite = useRemoveFavoriteRecipe();

  const recentIds = recentQuery.data?.items.map((item) => item.recipe_id) ?? [];
  const favoriteIds = new Set(favoritesQuery.data?.items.map((item) => item.recipe_id) ?? []);

  const detailQueries = useQueries({
    queries: recentIds.map((recipeId) => ({
      queryKey: recipeKeys.detail(recipeId),
      queryFn: () => fetchRecipeDetail(recipeId),
    })),
  });
  const missingProductsQueries = useQueries({
    queries: recentIds.map((recipeId) => ({
      queryKey: recipeKeys.missingProducts(recipeId, {}),
      queryFn: () => fetchMissingProducts(recipeId),
    })),
  });

  const recipes: RecipeCardSummary[] = [];
  recentIds.forEach((recipeId, index) => {
    const detail = detailQueries[index];
    const missingProducts = missingProductsQueries[index];
    if (detail?.data && missingProducts?.data) {
      recipes.push({
        ...toCardSummary(toRecipeViewModel(detail.data, missingProducts.data)),
        liked: favoriteIds.has(recipeId),
      });
    }
  });

  const detailsPending = recentIds.length > 0 && detailQueries.some((query) => query.isPending);
  const missingProductsPending =
    recentIds.length > 0 && missingProductsQueries.some((query) => query.isPending);
  const isPending = recentQuery.isPending || detailsPending || missingProductsPending;

  function handleToggleLike(id: string, liked: boolean) {
    if (addFavorite.isPending || removeFavorite.isPending) return;
    if (liked) {
      addFavorite.mutate(id);
    } else {
      removeFavorite.mutate(id);
    }
  }

  if (isPending) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SectionHeader
          leading="back"
          leadingHref="/mypage/fridge?tab=recipe"
          title="최근 본 레시피"
        />
        <LoadingIndicator label="최근 본 레시피를 불러오는 중이에요" className="flex-1" />
      </div>
    );
  }

  if (recentQuery.isError) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SectionHeader
          leading="back"
          leadingHref="/mypage/fridge?tab=recipe"
          title="최근 본 레시피"
        />
        <ErrorState
          className="flex-1"
          icon={<Icon name="alert" size={56} aria-hidden />}
          title="최근 본 레시피를 불러오지 못했어요"
          description="잠시 후 다시 시도해주세요"
          action={
            <FloatingButton icon="refresh" onClick={() => void recentQuery.refetch()}>
              다시 시도
            </FloatingButton>
          }
        />
      </div>
    );
  }

  return <RecentRecipesView recipes={recipes} onToggleLike={handleToggleLike} />;
}
