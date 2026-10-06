import type { ReactNode } from 'react';

import { Icon } from '@/components/atoms/Icon';

/**
 * 주문 상세의 금액·정보 한 줄 (molecule).
 * Figma "5팀 UI 공유용" — `OrderBreakdownGroup`(node 2461-7028) = `OrderBreakdownHeader`
 * (node 2461-7358) + 선택적 `OrderBreakdownDetailItem`(node 2461-7349) 목록.
 *
 * 장바구니의 `molecules/cart/CartAmountRow`(`List_Cart_Amount`, node 188-9639)와 모양이
 * 비슷하지만 다른 컴포넌트다 — 저쪽은 라벨이 `Text/Primary`(#222)인 "결제 예정 금액" 표고,
 * 이쪽은 라벨·값이 모두 `Text/Tertiary`(#7e8f9b)인 주문 내역 표다. 값 색만 행마다 달라
 * `valueTone` 으로 받는다.
 *
 * 토큰(실측): 헤더 16px — 라벨 `Heading/H6_Regular` → `text-heading-6`, 값
 * `Heading/H5_Medium` → `text-heading-5`. 헤더↔세부 간격 5px, 세부 항목 간격 `Gap/XS`8.
 * 세부 항목 14px — 라벨 `Label/XS_Regular` → `text-label-xs`, 값 `Label/M_Medium` →
 * `text-label-m`, 둘 다 `Text/Quaternary`(#8aa1ab). 좌측 꺾쇠는 `corner-bottom-left` 20px.
 */
export type OrderBreakdownValueTone = 'tertiary' | 'quaternary' | 'secondary';

export interface OrderBreakdownDetail {
  label: string;
  value: string;
}

export interface OrderBreakdownRowProps {
  label: string;
  value: ReactNode;
  /** 값 색. Figma 상 행마다 다르다(금액표 `#7e8f9b`, 결제방법 `#8aa1ab`, 배송정보 `#515e69`). */
  valueTone?: OrderBreakdownValueTone;
  /** 하위 분해 항목(쿠폰 → 상품 쿠폰/장바구니 쿠폰 등). */
  details?: OrderBreakdownDetail[];
  className?: string;
}

const VALUE_TONE: Record<OrderBreakdownValueTone, string> = {
  tertiary: 'text-fg-tertiary',
  quaternary: 'text-fg-quaternary',
  secondary: 'text-fg-secondary',
};

export function OrderBreakdownRow({
  label,
  value,
  valueTone = 'tertiary',
  details,
  className,
}: OrderBreakdownRowProps) {
  return (
    <div className={['flex flex-col gap-[5px]', className].filter(Boolean).join(' ')}>
      <div className="flex items-center justify-between">
        <span className="text-heading-6 text-fg-tertiary">{label}</span>
        <span className={`text-heading-5 ${VALUE_TONE[valueTone]}`}>{value}</span>
      </div>

      {details?.length ? (
        <ul className="flex flex-col gap-2">
          {details.map((detail) => (
            <li key={detail.label} className="flex items-center justify-between">
              <span className="text-label-xs text-fg-quaternary flex min-w-0 flex-1 items-center">
                <Icon name="corner-bottom-left" size={20} aria-hidden />
                {detail.label}
              </span>
              <span className="text-label-m text-fg-quaternary">{detail.value}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
