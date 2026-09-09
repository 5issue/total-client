'use client';

import { Button } from '@/components/atoms/Button';

/**
 * 장바구니 상단 배송지 행 (molecule).
 * Figma "5팀 UI 공유용" — `Frame 1430106635`.
 * 주소가 없으면 "배송지를 입력해주세요 + 추가", 있으면 "주소 + 변경".
 * 실제 배송지 선택 시트는 상위가 `onEdit` 으로 연다.
 */
export interface CartDeliveryAddressProps {
  /** 배송지 전체 주소. 없으면 미입력 상태. */
  address?: string;
  onEdit: () => void;
  className?: string;
}

export function CartDeliveryAddress({ address, onEdit, className }: CartDeliveryAddressProps) {
  return (
    <div
      className={['flex items-start justify-between gap-3 px-4 py-3', className]
        .filter(Boolean)
        .join(' ')}
    >
      {address ? (
        <p className="text-label-m text-fg-tertiary min-w-0 flex-1 pt-1">{address}</p>
      ) : (
        <p className="text-heading-6 text-fg min-w-0 flex-1 pt-1">배송지를 입력해주세요</p>
      )}
      <Button size="s" variant="outlineBlack" onClick={onEdit} className="shrink-0">
        {address ? '변경' : '추가'}
      </Button>
    </div>
  );
}
