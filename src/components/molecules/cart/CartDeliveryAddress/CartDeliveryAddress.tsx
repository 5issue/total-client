'use client';

import { Button } from '@/components/atoms/Button';

/**
 * 장바구니 상단 배송지 행 (molecule).
 * Figma "5팀 UI 공유용" — `Frame 1430106821` (node 188-9467).
 * 주소가 없으면 "배송지를 입력해주세요 + 추가"(문구는 `text-primary`),
 * 있으면 배송유형 뱃지 + 주소(`Heading/H6_Regular` 16/400, `Text/Primary`) + 변경.
 *
 * 토큰(node 188-9467): 컨테이너 `Surface/Base` `px-4 py-2`, 뱃지 `Bg/secondary`#f0f5f8 `rounded-full`
 * `Caption/M`12/400 `Text/Secondary`#515e69 → `bg-surface-secondary text-caption-m text-fg-secondary`.
 */
export interface CartDeliveryAddressProps {
  /** 배송지 전체 주소. 없으면 미입력 상태. */
  address?: string;
  /** 배송 유형 뱃지(예: "샛별배송"). 주소가 있고 해당 배송이 선택됐을 때만 전달. */
  deliveryBadge?: string;
  onEdit: () => void;
  className?: string;
}

export function CartDeliveryAddress({
  address,
  deliveryBadge,
  onEdit,
  className,
}: CartDeliveryAddressProps) {
  return (
    <div
      className={['bg-surface flex items-center justify-between gap-3 px-4 py-2', className]
        .filter(Boolean)
        .join(' ')}
    >
      {address ? (
        <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
          {deliveryBadge ? (
            <span className="bg-surface-secondary text-caption-m text-fg-secondary inline-flex h-6 items-center rounded-full px-2">
              {deliveryBadge}
            </span>
          ) : null}
          <p className="text-heading-6 text-fg">{address}</p>
        </div>
      ) : (
        <p className="text-heading-6 text-primary min-w-0 flex-1">배송지를 입력해주세요</p>
      )}
      <Button size="s" variant="outlineBlack" onClick={onEdit} className="shrink-0">
        {address ? '변경' : '추가'}
      </Button>
    </div>
  );
}
