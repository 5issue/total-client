'use client';

import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Icon } from '@/components/atoms/Icon';
import { RecipeCardL } from '@/components/molecules/mypage/RecipeCardL';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useScrollToTopVisibility } from '@/hooks/useScrollToTopVisibility';

import type { RecipeCardSummary } from './model';

export interface RecentRecipesViewProps {
  recipes: RecipeCardSummary[];
  onToggleLike: (id: string, liked: boolean) => void;
}

/**
 * "최근 본 레시피" 전체보기(node 666-31937/31971/32042/32007). 진입점이
 * MY 레시피 메인(`/mypage/fridge?tab=recipe`) 하나뿐이라 뒤로가기는 `leadingHref`로
 * 고정한다(`MyFridgeView`와 동일 컨벤션).
 *
 * "전체선택(N/M)"·"선택삭제" 다건 삭제 UI(`RecipeSelectionToolbar`)는 이번 연동에서
 * 뺐다(이슈 #153) — RECENT-01~02 스펙에 삭제 엔드포인트가 없어, 눌러도 새로고침하면
 * 되살아나는 가짜 동작이 된다. 백엔드팀 확인 후 별도로 다시 붙인다.
 */
export function RecentRecipesView({ recipes, onToggleLike }: RecentRecipesViewProps) {
  const showScrollTop = useScrollToTopVisibility();

  return (
    <div className="flex min-h-dvh flex-col">
      <SectionHeader
        leading="back"
        leadingHref="/mypage/fridge?tab=recipe"
        title="최근 본 레시피"
      />

      {recipes.length === 0 ? (
        <div className="flex justify-center py-16">
          <ErrorState
            icon={<Icon name="review" size={56} aria-hidden />}
            title="최근 본 레시피가 없어요"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 justify-items-center gap-x-2.5 gap-y-5 px-4 py-4">
          {recipes.map((recipe) => (
            <RecipeCardL
              key={recipe.id}
              recipe={recipe}
              onToggleLike={(liked) => onToggleLike(recipe.id, liked)}
            />
          ))}
        </div>
      )}

      {showScrollTop ? (
        <FloatingButton
          shape="icon"
          icon="scroll"
          aria-label="맨 위로 이동"
          onClick={() => {
            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
          }}
          className="fixed right-4 bottom-20 z-10"
        />
      ) : null}
    </div>
  );
}
