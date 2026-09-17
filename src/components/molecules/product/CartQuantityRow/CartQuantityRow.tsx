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
 * 동일 컴포넌트다. 담기 시트 맥락이라 `min={1}` — 0개를 담을 순 없다(기본 min=0인
 * 범용 스테퍼와 다르게, 삭제는 별도 동작이지 감소로 0까지 가는 게 아니다).
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
  /** 기본 1(담기 시트 — 0개를 담을 순 없다). 다중 옵션 시트(node 665:43562)처럼 옵션별
   *  수량이 미선택(0)에서 시작해야 하면 0으로 넘긴다. */
  min?: number;
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
  min = 1,
  className,
}: CartQuantityRowProps) {
  return (
    // items-start 필수 — 없으면 flex-col 기본값(align-items: stretch) 때문에 폭을
    // 명시하지 않은 뱃지가 행 전체 폭으로 늘어난다(ProductCard 의 Kurly Only 뱃지와
    // 같은 함정, 다중 옵션 시트 QA 중 발견).
    <div
      className={['flex w-full flex-col items-start gap-1', className].filter(Boolean).join(' ')}
    >
      {badgeLabel ? (
        <Badge color="cyan" size="small">
          <span className="font-bold">{badgeLabel}</span>
        </Badge>
      ) : null}
      <p className="text-body-m text-fg w-full">{name}</p>
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex items-end gap-1.5">
          <span className="text-numeric-l font-numeric text-fg">{priceLabel}</span>
          {originalPriceLabel ? (
            <span className="text-numeric-m font-numeric text-fg-quaternary line-through">
              {originalPriceLabel}
            </span>
          ) : null}
        </div>
        <QuantityStepper
          value={quantity}
          onChange={onQuantityChange}
          min={min}
          label={`${name} 수량`}
        />
      </div>
      <p className="text-caption-m font-numeric text-fg-secondary w-full">{unitPriceLabel}</p>
    </div>
  );
}
