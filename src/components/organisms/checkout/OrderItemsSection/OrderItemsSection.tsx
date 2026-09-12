'use client';

import { useState } from 'react';

import Image from 'next/image';

import { Icon } from '@/components/atoms/Icon';
import { OrderLineItem } from '@/components/molecules/checkout/OrderLineItem';
import type { OrderLineItemView } from '@/components/organisms/checkout/model';

/**
 * 주문상품 섹션 (organism). 1건이면 평범한 목록(Figma node 666-23208), 2건 이상이면
 * 아코디언으로 바뀐다(Figma node 666-23446 접힘 / 666-25396 펼침).
 *
 * `molecules/shared/Accordion`(제네릭 셸)을 안 쓴 이유 — 그 컴포넌트는 열림/닫힘에서
 * 같은 children 을 보였다 숨겼다만 한다. 여기는 접힘일 때 "상품명 외 N건" + 썸네일 4장
 * 요약을, 펼침일 때 전체 목록(각 줄 가격·수량 포함)을 — 서로 다른 콘텐츠를 보여줘야
 * 해서 open 상태에 따라 직접 분기한다.
 *
 * 타이틀 행(제목+쉐브론)은 애니메이션 대상이 아니고, 그 아래 본문만 부드럽게 펼쳐진다
 * (피드백, 2026-09-11). 콘텐츠가 열림/닫힘에서 서로 다른 두 블록이라(위 문단) 보통의
 * "같은 콘텐츠를 max-height 로 자르는" 아코디언 트릭을 못 쓴다 — 대신 두 블록을 항상
 * DOM 에 유지하고 각각을 독립된 `grid-template-rows: 0fr↔1fr` 컨테이너로 감싸(auto-height
 * 를 트랜지션하는 표준 CSS 기법) 요약 블록은 0fr 로 접히고 목록 블록은 1fr 로 펼쳐지는
 * 걸 동시에 트랜지션한다 — 두 블록 높이가 서로 다른 크로스페이드형 "부드럽게 펼침".
 */
export interface OrderItemsSectionProps {
  items: OrderLineItemView[];
  /** 배송 그룹 라벨(예: "샛별배송"). */
  deliveryLabel?: string;
  className?: string;
}

const MAX_PREVIEW_THUMBNAILS = 4;

export function OrderItemsSection({
  items,
  deliveryLabel = '샛별배송',
  className,
}: OrderItemsSectionProps) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  // 1건은 접고 펼 이유가 없다 — Figma 도 이 상태엔 아코디언 쉘 자체가 없다.
  if (items.length === 1) {
    const item = items[0];
    if (!item) return null;
    return (
      <div className={['bg-surface flex flex-col gap-4 p-4', className].filter(Boolean).join(' ')}>
        <p className="text-heading-4 text-fg">주문상품</p>
        <div className="flex flex-col gap-2">
          <p className="text-label-m text-fg-secondary">{deliveryLabel}</p>
          <OrderLineItem
            name={item.name}
            imageSrc={item.imageSrc}
            price={item.price}
            originalPrice={item.originalPrice}
            quantity={item.quantity}
          />
        </div>
      </div>
    );
  }

  const firstItem = items[0];
  if (!firstItem) return null;
  const restCount = items.length - 1;
  const previewItems = items.slice(0, MAX_PREVIEW_THUMBNAILS);

  return (
    <div className={['bg-surface flex flex-col', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-4"
      >
        <span className="text-heading-4 text-fg">주문상품</span>
        <Icon
          name="arrow-down"
          size={24}
          className={`text-fg shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {/* 펼침: 전체 목록. 두 블록 다 항상 마운트해두고 grid-rows 로만 접었다 펼친다 —
          `open ? X : null` 로 언마운트하면 트랜지션이 걸리지 않는다. */}
      <div
        aria-hidden={!open}
        className={[
          'grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        ].join(' ')}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 px-4 pb-8">
            <p className="text-label-m text-fg-secondary">{deliveryLabel}</p>
            <hr className="border-border" />
            <ul className="flex flex-col gap-4.5">
              {items.map((item) => (
                <li key={item.id}>
                  <OrderLineItem
                    name={item.name}
                    imageSrc={item.imageSrc}
                    price={item.price}
                    originalPrice={item.originalPrice}
                    quantity={item.quantity}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 접힘: 요약("상품명 외 N건" + 썸네일). */}
      <div
        aria-hidden={open}
        className={[
          'grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
          open ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]',
        ].join(' ')}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 px-4 pb-3">
            <p className="text-label-m text-fg">
              {firstItem.name} 외 {restCount}건
            </p>
            <div className="flex items-center gap-3">
              {previewItems.map((item) =>
                item.imageSrc ? (
                  <Image
                    key={item.id}
                    src={item.imageSrc}
                    alt=""
                    width={52}
                    height={52}
                    className="aspect-square size-13 shrink-0 rounded-sm object-cover"
                  />
                ) : (
                  <div
                    key={item.id}
                    aria-hidden
                    className="bg-surface-secondary aspect-square size-13 shrink-0 rounded-sm"
                  />
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
