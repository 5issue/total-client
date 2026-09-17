'use client';

import { QuantityStepper } from '@/components/molecules/shared/QuantityStepper';

/**
 * 장바구니 담기 바텀시트 — 실제 담을 상품 + 수량 조절 행 (molecule).
 * Figma "5팀 디자인 시스템" > `Item_H_Bottomsheet_Cart`(node 2461:7212).
 *
 * 가격/스테퍼는 Figma 원본이 스테퍼를 절대 위치로 겹쳐뒀지만, `flex justify-between`
 * 로 대체해도 시각 결과가 동일하고 더 견고하다.
 *
 * `QuantityStepper`(84px pill, node 2429-3870)를 그대로 재사용 — 이 노드의 스테퍼와
 * 동일 컴포넌트다. 담기 시트 맥락이라 기본 `min=1` — 0개를 담을 순 없다(기본 min=0인
 * 범용 스테퍼와 다르게, 삭제는 별도 동작이지 감소로 0까지 가는 게 아니다). 다만 한
 * 상품에 여러 가격 등급 줄이 함께 뜨는 화면(나의 냉장고 "채워넣기" — 일반가/멤버스가
 * 중 하나만 골라도 되는 경우, node 1206-109860)은 `min={0}` 으로 override 한다.
 *
 * "멤버스" 뱃지는 `atoms/Badge`(cyan/small = 22px, `px-2 py-1`)가 아니라 이 노드
 * 전용 `PromoBadge`(node 2461-7209, 18px 고정)를 직접 그린다 — `Badge` 를 썼을 때
 * 실측보다 커 보이는 버그가 있었다(#111 QA). `text-caption-s` 는 기본 400 이라
 * `font-bold` 로 700 override. 부모가 `flex-col`이라 기본 `align-items: stretch`로
 * 뱃지가 가로 폭 전체로 늘어나 버려 `self-start`로 내용 크기만큼만 차지하도록 고정한다
 * (겉으로 봤을 때 뱃지가 다시 "커 보이는" 두 번째 원인, #111 QA).
 */
export type CartQuantityRowProps = {
  /** 있으면 상품명 위에 뱃지를 렌더한다(예: "멤버스"). */
  badgeLabel?: string;
  name: string;
  /** 최종가 표기(예: "2,520원"). */
  priceLabel: string;
  /** 정가 표기(취소선) — 있을 때만 렌더. */
  originalPriceLabel?: string;
  /** 단위가(예: "100g 당 360원") — 있을 때만 렌더. */
  unitPriceLabel?: string;
  quantity: number;
  onQuantityChange: (value: number) => void;
  /** 스테퍼 최소값. 기본 1. */
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
    <div className={['flex w-full flex-col gap-1', className].filter(Boolean).join(' ')}>
      {badgeLabel ? (
        <span className="bg-cyan inline-flex h-4.5 shrink-0 items-center justify-center self-start rounded-sm px-2">
          <span className="text-caption-s font-bold text-white">{badgeLabel}</span>
        </span>
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
        <QuantityStepper
          value={quantity}
          onChange={onQuantityChange}
          min={min}
          label={`${name} 수량`}
        />
      </div>
      {unitPriceLabel ? (
        <p className="text-caption-m font-numeric text-fg-secondary">{unitPriceLabel}</p>
      ) : null}
    </div>
  );
}
