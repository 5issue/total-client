'use client';

import { Checkbox } from '@/components/atoms/Checkbox';

/**
 * 반품 접수 전체선택 행 (molecule). Figma "5팀 UI 공유용" — node 848-82641
 * `Frame 1430106926`.
 *
 * 장바구니 `CartSelectAllBar` 와 달리 선택삭제 버튼이 없고, 카운트는 `(n/n)` 형식이며
 * 타이포는 Heading/H2_Medium(18/500) → `text-heading-2`. 일부 선택은 not checked
 * (indeterminate 없음 — 장바구니와 동일).
 */
export interface RefundSelectAllBarProps {
  selectedCount: number;
  totalCount: number;
  onToggleAll: (checked: boolean) => void;
  className?: string;
}

export function RefundSelectAllBar({
  selectedCount,
  totalCount,
  onToggleAll,
  className,
}: RefundSelectAllBarProps) {
  const allSelected = totalCount > 0 && selectedCount === totalCount;

  return (
    <div className={['flex items-center', className].filter(Boolean).join(' ')}>
      {/* Figma 체크박스 래퍼 40×40. */}
      <span className="flex size-10 shrink-0 items-center justify-center">
        <Checkbox
          variant="filled"
          label="전체 선택"
          checked={allSelected}
          disabled={totalCount === 0}
          onChange={(e) => onToggleAll(e.target.checked)}
          className="size-10"
        />
      </span>
      <span className="text-heading-2 text-fg flex items-center gap-1">
        <span>전체선택</span>
        <span>
          ({selectedCount}/{totalCount})
        </span>
      </span>
    </div>
  );
}
