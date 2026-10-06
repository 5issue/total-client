'use client';

import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/Checkbox';

/**
 * 전체선택 + 선택삭제 바 (molecule).
 * Figma "5팀 UI 공유용" — `Frame 1430106797` (`List_Filter_Checkbox` + 선택삭제).
 * 선택 상태는 상위(CartView)가 소유 — 여기선 개수만 받아 표시하고 토글/삭제를 알린다.
 */
export interface CartSelectAllBarProps {
  selectedCount: number;
  totalCount: number;
  onToggleAll: (checked: boolean) => void;
  onDeleteSelected: () => void;
  className?: string;
}

export function CartSelectAllBar({
  selectedCount,
  totalCount,
  onToggleAll,
  onDeleteSelected,
  className,
}: CartSelectAllBarProps) {
  // check / not check 2가지만 — 일부 선택은 not checked 로 표시(indeterminate 미사용).
  const allSelected = totalCount > 0 && selectedCount === totalCount;

  return (
    <div
      className={['flex items-center justify-between px-4 py-3', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center">
        <span className="flex size-8 shrink-0 items-center justify-center">
          <Checkbox
            variant="filled"
            label="전체 선택"
            checked={allSelected}
            disabled={totalCount === 0}
            onChange={(e) => onToggleAll(e.target.checked)}
          />
        </span>
        {/* Figma node 188-9366/9367: "전체선택"·"n/4" 모두 Heading/H5_Medium(16/500) · Text/Primary. */}
        <span className="text-heading-5 text-fg flex items-center gap-1">
          <span>전체선택</span>
          <span>
            {selectedCount}/{totalCount}
          </span>
        </span>
      </div>
      {/* Figma node 188-9634: h-32(=size xs), w-74 는 px-3 로 근사. */}
      <Button
        size="xs"
        variant="outlineBlack"
        onClick={onDeleteSelected}
        disabled={selectedCount === 0}
      >
        선택삭제
      </Button>
    </div>
  );
}
