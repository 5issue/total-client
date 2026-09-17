'use client';

import { useState } from 'react';

import Image from 'next/image';

import { BottomSheet } from '@/components/molecules/shared/BottomSheet';
import { QuantityStepper } from '@/components/molecules/shared/QuantityStepper';
import { formatPrice } from '@/lib/formatters';

import type { RecipeNeededProduct } from './model';

/**
 * "장바구니에 한번에 담기" 바텀시트(node 666-31755 "RelatedProductsBottomSheet").
 * 레시피에 필요한 재료를 한 번에 나열하고, 상품마다 `QuantityStepper`로 수량을
 * 바꿔 총액을 확인한 뒤 주문한다.
 *
 * `items`는 열리는 트랜지션 중에도 비우지 않는다 — `FridgeRefillBottomSheet`와 같은
 * 이유로 `open`이 true 로 바뀔 때만 수량을 기본값(1개씩)으로 재설정한다.
 */
export interface RecipeCartBottomSheetProps {
  open: boolean;
  items: RecipeNeededProduct[];
  onClose: () => void;
  onSubmit: (totalPrice: number) => void;
}

export function RecipeCartBottomSheet({
  open,
  items,
  onClose,
  onSubmit,
}: RecipeCartBottomSheetProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuantities(Object.fromEntries(items.map((item) => [item.id, 1])));
    }
  }

  const totalPrice = items.reduce((sum, item) => sum + item.price * (quantities[item.id] ?? 1), 0);
  const totalQuantity = items.reduce((sum, item) => sum + (quantities[item.id] ?? 1), 0);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      ariaLabel="레시피에 필요한 재료"
      footer={
        <div className="flex items-center justify-center px-4 py-3">
          <button
            type="button"
            disabled={totalQuantity === 0}
            onClick={() => onSubmit(totalPrice)}
            className="rounded-m bg-primary text-heading-1 text-fg-inverse disabled:bg-brand-50 disabled:text-brand-200 flex h-14 w-full items-center justify-center"
          >
            {formatPrice(totalPrice)} 주문하기
          </button>
        </div>
      }
    >
      <div className="bg-surface flex h-10 items-center px-4">
        <p className="text-heading-1 text-fg">레시피에 필요한 재료 ({items.length})</p>
      </div>
      <div className="flex flex-col gap-2 px-4 py-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-surface-secondary relative h-21 w-15.75 shrink-0 overflow-hidden rounded-sm">
                <Image src={item.imageSrc} alt="" fill sizes="63px" className="object-cover" />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-label-m text-fg line-clamp-1 w-45">{item.name}</p>
                <div className="flex items-center gap-1">
                  {item.discountLabel ? (
                    <span className="text-orange text-caption-l font-bold">
                      {item.discountLabel}
                    </span>
                  ) : null}
                  <span className="text-label-m text-fg font-bold">{item.priceLabel}</span>
                </div>
              </div>
            </div>
            <QuantityStepper
              value={quantities[item.id] ?? 1}
              onChange={(value) => setQuantities((prev) => ({ ...prev, [item.id]: value }))}
              min={0}
              label={`${item.name} 수량`}
            />
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}
