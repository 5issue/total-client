'use client';

import { FloatingButton } from '@/components/atoms/FloatingButton';
import { LoadingIndicator } from '@/components/atoms/LoadingIndicator';
import { FullScreenErrorState } from '@/components/molecules/shared/FullScreenErrorState';
import { useMissingProducts } from '@/hooks/recipe/useMissingProducts';
import { useRecipeDetail } from '@/hooks/recipe/useRecipeDetail';

import { toRecipeViewModel } from './mapRecipe';
import { RecipeDetailView } from './RecipeDetailView';

export interface RecipeDetailContainerProps {
  recipeId: string;
}

/**
 * `RecipeDetailView`(표현 컴포넌트) 컨테이너 — `useRecipeDetail`/`useMissingProducts`
 * (AI 파트 RECIPE-01/03, 이슈 #140)를 소비한다. RSC `page.tsx`는 `recipeId`만 꺼내
 * 넘기고, 조회와 로딩·에러(레시피 없음 포함)는 이 클라이언트 컨테이너가 맡는다 —
 * 기존 `notFound()`(RSC 전용) 대신 같은 404 비주얼(`FullScreenErrorState`, 전역
 * `not-found.tsx`와 동일 일러스트)을 클라이언트에서 직접 그린다.
 */
export function RecipeDetailContainer({ recipeId }: RecipeDetailContainerProps) {
  const detailQuery = useRecipeDetail(recipeId);
  const missingProductsQuery = useMissingProducts(recipeId);

  if (detailQuery.isPending || missingProductsQuery.isPending) {
    return (
      <div className="flex min-h-dvh flex-col">
        <LoadingIndicator label="레시피 정보를 불러오는 중이에요" className="flex-1" />
      </div>
    );
  }

  if (
    detailQuery.isError ||
    missingProductsQuery.isError ||
    !detailQuery.data ||
    !missingProductsQuery.data
  ) {
    return (
      <FullScreenErrorState
        illustration="document-error"
        title="레시피를 찾을 수 없어요"
        description="주소를 다시 확인하거나 이전 화면으로 돌아가 주세요"
        action={
          <FloatingButton
            icon="refresh"
            onClick={() => {
              void detailQuery.refetch();
              void missingProductsQuery.refetch();
            }}
          >
            다시 시도
          </FloatingButton>
        }
      />
    );
  }

  const recipe = toRecipeViewModel(detailQuery.data, missingProductsQuery.data);

  return <RecipeDetailView recipe={recipe} />;
}
