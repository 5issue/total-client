'use client';

import { Checkbox } from '@/components/atoms/Checkbox';

/**
 * "전체선택(n/총계)" + "선택삭제" 툴바 (molecule). Figma "5팀 UI 공유용" node 666-31963~31970
 * ("최근 본 레시피" 전체보기) — `FridgeSelectionToolbar`(node 1120-56176)와 실측까지 동일한
 * 스펙이라 같은 구조로 만든다(체크박스 44px 터치 타깃 보정, 74×32 아웃라인 버튼 등).
 */
export interface RecipeSelectionToolbarProps {
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  onToggleSelectAll: (checked: boolean) => void;
  onDeleteSelected: () => void;
  className?: string;
}

export function RecipeSelectionToolbar({
  selectedCount,
  totalCount,
  allSelected,
  onToggleSelectAll,
  onDeleteSelected,
  className,
}: RecipeSelectionToolbarProps) {
  return (
    <div
      className={['flex items-center justify-between px-4 py-3', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex h-8 items-center">
        {/* `Checkbox` 의 `<label>` 은 항상 44px 터치 타깃(size-11)인데 Figma 실측 체크박스
            자리는 32px 뿐이라, 감싸는 요소를 `-m-1.5`(-6px×4변=-12px)만큼 당겨 44-12=32px로
            맞춘다(`FridgeSelectionToolbar`와 동일 보정 원칙). */}
        <span className="-m-1.5 inline-flex">
          <Checkbox
            variant="filled"
            label="전체선택"
            checked={allSelected}
            disabled={totalCount === 0}
            onChange={(e) => onToggleSelectAll(e.target.checked)}
          />
        </span>
        <span className="text-heading-5 text-fg">전체선택</span>
        <span className="text-body-s text-fg-tertiary ml-1">
          ({selectedCount}/{totalCount})
        </span>
      </div>
      {/* Figma(node 666-31970)는 선택 개수와 무관하게 항상 활성 스타일 — 선택 없이 눌러도
          삭제할 게 없어 조용히 아무 일도 안 한다(모달을 열 필요 없음). 바깥 `button`은 44px
          터치 타깃으로 키우고 `-my-1.5`로 레이아웃 차지 공간은 32px 그대로 되돌린다. */}
      <button
        type="button"
        onClick={onDeleteSelected}
        className="-my-1.5 flex h-11 shrink-0 items-center justify-center"
      >
        <span className="text-label-l text-fg flex h-8 w-18.5 items-center justify-center gap-1 rounded-sm border border-neutral-400 px-1 py-2">
          선택삭제
        </span>
      </button>
    </div>
  );
}
