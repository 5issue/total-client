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
      <div className="flex items-center gap-1">
        <Checkbox
          variant="filled"
          label="전체 선택"
          checked={allSelected}
          disabled={totalCount === 0}
          onChange={(e) => onToggleAll(e.target.checked)}
        />
        <span className="text-label-l text-fg">
          전체선택{' '}
          <span className="text-fg-quaternary">
            {selectedCount}/{totalCount}
          </span>
        </span>
      </div>
      <Button
        size="s"
        variant="outlineBlack"
        onClick={onDeleteSelected}
        disabled={selectedCount === 0}
      >
        선택삭제
      </Button>
    </div>
  );
}
