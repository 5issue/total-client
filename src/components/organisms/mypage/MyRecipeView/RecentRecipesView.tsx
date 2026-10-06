'use client';

import { useState } from 'react';

import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Icon } from '@/components/atoms/Icon';
import { RecipeCardL } from '@/components/molecules/mypage/RecipeCardL';
import { RecipeSelectionToolbar } from '@/components/molecules/mypage/RecipeSelectionToolbar';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useScrollToTopVisibility } from '@/hooks/useScrollToTopVisibility';

import type { RecipeCardSummary } from './model';
import { RecipeDeleteConfirmModal } from './RecipeDeleteConfirmModal';

export interface RecentRecipesViewProps {
  recipes: RecipeCardSummary[];
  onToggleLike: (id: string, liked: boolean) => void;
  onDeleteSelected: (ids: string[]) => void;
}

/**
 * "최근 본 레시피" 전체보기(node 666-31937/31971/32042/32007). 진입점이
 * MY 레시피 메인(`/mypage/fridge?tab=recipe`) 하나뿐이라 뒤로가기는 `leadingHref`로
 * 고정한다(`MyFridgeView`와 동일 컨벤션).
 *
 * "전체선택(N/M)"·"선택삭제"(`RecipeSelectionToolbar`)는 이슈 #177(RECENT-03)에서 추가 —
 * 선택 상태는 `MyFridgeView`와 동일하게 이 컴포넌트가 소유하고, 실제 삭제는
 * `onDeleteSelected`로 위임한다(목록은 컨테이너의 mutation 성공 후 invalidate로 반영,
 * Optimistic Update 아님).
 */
export function RecentRecipesView({
  recipes,
  onToggleLike,
  onDeleteSelected,
}: RecentRecipesViewProps) {
  const showScrollTop = useScrollToTopVisibility();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const selectedCount = selectedIds.size;
  const allSelected = recipes.length > 0 && selectedCount === recipes.length;

  function handleToggleItem(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleToggleSelectAll(checked: boolean) {
    setSelectedIds(checked ? new Set(recipes.map((recipe) => recipe.id)) : new Set());
  }

  function handleConfirmDelete() {
    onDeleteSelected([...selectedIds]);
    setSelectedIds(new Set());
    setDeleteModalOpen(false);
  }

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
        <>
          <RecipeSelectionToolbar
            selectedCount={selectedCount}
            totalCount={recipes.length}
            allSelected={allSelected}
            onToggleSelectAll={handleToggleSelectAll}
            onDeleteSelected={() => {
              if (selectedCount > 0) setDeleteModalOpen(true);
            }}
          />
          <div className="grid grid-cols-2 justify-items-center gap-x-2.5 gap-y-5 px-4 py-4">
            {recipes.map((recipe) => (
              <RecipeCardL
                key={recipe.id}
                recipe={recipe}
                selectable
                checked={selectedIds.has(recipe.id)}
                onCheckedChange={(checked) => handleToggleItem(recipe.id, checked)}
                onToggleLike={(liked) => onToggleLike(recipe.id, liked)}
              />
            ))}
          </div>
        </>
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

      <RecipeDeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
