'use client';

import { Icon } from '@/components/atoms/Icon';
import { RecipeCardL } from '@/components/molecules/mypage/RecipeCardL';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';

import type { RecipeCardSummary } from './model';

export interface LikedRecipesViewProps {
  recipes: RecipeCardSummary[];
  onToggleLike: (id: string, liked: boolean) => void;
}

/**
 * "찜한 레시피" 전체보기(node 666-32087). 선택삭제 없이 하트 토글만 있다 — 찜을
 * 풀면 목록에서 바로 사라진다(성공 후 찜 목록 invalidate, `LikedRecipesViewContainer`
 * 참고). 진입점이 MY 레시피 메인 하나뿐이라 `leadingHref` 고정(`RecentRecipesView`와
 * 동일 컨벤션).
 */
export function LikedRecipesView({ recipes, onToggleLike }: LikedRecipesViewProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SectionHeader leading="back" leadingHref="/mypage/fridge?tab=recipe" title="찜한 레시피" />

      {recipes.length === 0 ? (
        <div className="flex justify-center py-16">
          <ErrorState
            icon={<Icon name="heart" size={56} aria-hidden />}
            title="찜한 레시피가 없어요"
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
    </div>
  );
}
