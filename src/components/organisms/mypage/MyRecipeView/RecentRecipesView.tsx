'use client';

import { useState } from 'react';

import { Checkbox } from '@/components/atoms/Checkbox';
import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Icon } from '@/components/atoms/Icon';
import { RecipeCardL } from '@/components/molecules/mypage/RecipeCardL';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useScrollToTopVisibility } from '@/hooks/useScrollToTopVisibility';

import { findRecipe, MOCK_RECENT_RECIPE_IDS } from './mock';
import type { RecipeCardSummary } from './model';
import { toCardSummary } from './model';
import { RecipeDeleteConfirmModal } from './RecipeDeleteConfirmModal';

/**
 * "최근 본 레시피" 전체보기(node 666-31937/31971/32042/32007). 진입점이
 * MY 레시피 메인(`/mypage/fridge?tab=recipe`) 하나뿐이라 뒤로가기는 `leadingHref`로
 * 고정한다(`MyFridgeView`와 동일 컨벤션).
 *
 * "전체선택(N/M)"·"선택삭제"·삭제 확인 모달은 `MyFridgeView`의 그리드 선택삭제
 * 흐름과 동일 UX다(#112가 리뷰 중이라 그 컴포넌트를 그대로 가져오지 않고 같은
 * 패턴으로 새로 둠 — 계획 검토 시 논의한 내용). 스크롤 상단이동 버튼 노출 조건은
 * `useScrollToTopVisibility`(범용 훅, `src/hooks/`)를 그대로 재사용한다.
 */
function RecipeSelectionToolbar({
  selectedCount,
  totalCount,
  allSelected,
  onToggleSelectAll,
  onDeleteSelected,
}: {
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  onToggleSelectAll: (checked: boolean) => void;
  onDeleteSelected: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex h-8 items-center">
        <span className="-m-1.5 inline-flex">
          <Checkbox
            variant="filled"
            label="전체선택"
            checked={allSelected}
            onChange={(e) => onToggleSelectAll(e.target.checked)}
          />
        </span>
        <span className="text-heading-5 text-fg">전체선택</span>
        <span aria-live="polite" className="text-body-s text-fg-tertiary ml-1">
          ({selectedCount}/{totalCount})
        </span>
      </div>
      {/* 시각 크기(32px)는 Figma 그대로 두고 바깥 버튼을 44px 터치 영역으로 키운다
          (코드래빗 리뷰) — 안쪽 span 이 테두리·글자를 그대로 담당. */}
      <button
        type="button"
        onClick={onDeleteSelected}
        className="flex h-11 w-18.5 shrink-0 items-center justify-center"
      >
        <span className="border-border text-label-l text-fg flex h-8 w-full items-center justify-center gap-1 rounded-sm border px-1 py-2">
          선택삭제
        </span>
      </button>
    </div>
  );
}

export function RecentRecipesView() {
  const [recipes, setRecipes] = useState<RecipeCardSummary[]>(() =>
    MOCK_RECENT_RECIPE_IDS.map((id) => toCardSummary(findRecipe(id)!)),
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const showScrollTop = useScrollToTopVisibility();

  const selectedCount = recipes.filter((recipe) => selectedIds.has(recipe.id)).length;
  const allSelected = recipes.length > 0 && selectedCount === recipes.length;

  function handleToggleSelectAll(checked: boolean) {
    setSelectedIds(checked ? new Set(recipes.map((recipe) => recipe.id)) : new Set());
  }

  function handleToggleLike(id: string, liked: boolean) {
    setRecipes((prev) => prev.map((recipe) => (recipe.id === id ? { ...recipe, liked } : recipe)));
  }

  function handleConfirmDelete() {
    setRecipes((prev) => prev.filter((recipe) => !selectedIds.has(recipe.id)));
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
          <div className="grid grid-cols-2 justify-items-center gap-x-2.5 gap-y-5 px-4 pb-6">
            {recipes.map((recipe) => (
              <RecipeCardL
                key={recipe.id}
                recipe={recipe}
                selectable
                checked={selectedIds.has(recipe.id)}
                onCheckedChange={(checked) =>
                  setSelectedIds((prev) => {
                    const next = new Set(prev);
                    if (checked) next.add(recipe.id);
                    else next.delete(recipe.id);
                    return next;
                  })
                }
                onToggleLike={(liked) => handleToggleLike(recipe.id, liked)}
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
