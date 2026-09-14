'use client';

import { Badge } from '@/components/atoms/Badge';
import { QuantityStepper } from '@/components/molecules/shared/QuantityStepper';

/**
 * 장바구니 담기 바텀시트 — 실제 담을 상품 + 수량 조절 행 (molecule).
 * Figma "5팀 디자인 시스템" > `Item_H_Bottomsheet_Cart`(node 2461:7212).
 *
 * 가격/스테퍼는 Figma 원본이 스테퍼를 절대 위치로 겹쳐뒀지만, `flex justify-between`
 * 로 대체해도 시각 결과가 동일하고 더 견고하다.
 *
 * `QuantityStepper`(84px pill, node 2429-3870)를 그대로 재사용 — 이 노드의 스테퍼와
 * 동일 컴포넌트다.
 */
export type CartQuantityRowProps = {
  /** 있으면 상품명 위에 뱃지를 렌더한다(예: "멤버스"). */
  badgeLabel?: string;
  name: string;
  /** 최종가 표기(예: "2,520원"). */
  priceLabel: string;
  /** 정가 표기(취소선). */
  originalPriceLabel?: string;
  /** 단위가(예: "100g 당 360원"). */
  unitPriceLabel: string;
  quantity: number;
  onQuantityChange: (value: number) => void;
  className?: string;
};

export function CartQuantityRow({
  badgeLabel,
  name,
  priceLabel,
  originalPriceLabel,
  unitPriceLabel,
  quantity,
  onQuantityChange,
  className,
}: CartQuantityRowProps) {
  return (
    <div className={['flex w-full flex-col gap-1', className].filter(Boolean).join(' ')}>
      {badgeLabel ? (
        <Badge color="cyan" size="small">
          <span className="font-bold">{badgeLabel}</span>
        </Badge>
      ) : null}
      <p className="text-body-m text-fg">{name}</p>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-end gap-1.5">
          <span className="text-numeric-l font-numeric text-fg">{priceLabel}</span>
          {originalPriceLabel ? (
            <span className="text-numeric-m font-numeric text-fg-quaternary line-through">
              {originalPriceLabel}
            </span>
          ) : null}
        </div>
        <QuantityStepper value={quantity} onChange={onQuantityChange} label={`${name} 수량`} />
      </div>
      <p className="text-caption-m font-numeric text-fg-secondary">{unitPriceLabel}</p>
    </div>
  );
}
