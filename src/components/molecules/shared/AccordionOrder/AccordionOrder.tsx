'use client';

import type { ReactNode } from 'react';

import { Accordion } from '@/components/molecules/shared/Accordion';

/**
 * 주문 상품 목록 아코디언 (molecule).
 * Figma "5팀 디자인 시스템" — node 2415-5383 "Accordion_Order".
 *
 * `Accordion` 셸 + 배송 묶음(라벨 + 구분선). 상품 카드는 `children` 으로 받아
 * 카드 종류에 무관하다 — Figma `Item_H_Order` 가 바뀌어도 이 셸은 그대로.
 */
export interface AccordionOrderProps {
  title?: string;
  /** 배송 묶음 라벨(예: "샛별배송"). 없으면 라벨·구분선 생략. */
  deliveryLabel?: string;
  /** 상품 카드. */
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function AccordionOrder({
  title = '주문상품',
  deliveryLabel = '샛별배송',
  children,
  defaultOpen = false,
  className,
}: AccordionOrderProps) {
  return (
    <Accordion
      header={title}
      defaultOpen={defaultOpen}
      className={className}
      headerClassName="px-4 py-3"
    >
      <div className="px-4 pt-2 pb-4">
        <div className="border-border rounded-xl border px-4 pt-4 pb-5">
          {deliveryLabel ? (
            <>
              <p className="text-heading-5 text-fg mb-3">{deliveryLabel}</p>
              <div className="border-border mb-3 border-t" />
            </>
          ) : null}
          <div className="flex flex-col gap-4.5">{children}</div>
        </div>
      </div>
    </Accordion>
  );
}
