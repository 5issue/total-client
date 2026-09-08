'use client';

import { CartRecommendItemRow } from '@/components/molecules/cart/CartRecommendItemRow';
import { BottomSheet } from '@/components/molecules/shared/BottomSheet';
import { CartOrderBar } from '@/components/organisms/cart/CartOrderBar';
import type { RecommendProductView } from '@/components/organisms/cart/model';

/**
 * "함께 구매하면 좋은 상품" 추천 바텀시트 (organism).
 * Figma 디자인시스템 — `Bottomsheet_Cart` (node 2676-5293).
 *
 * 주문하기를 누르면 열린다. 시트 안에서 추천 상품을 담거나(`onAddItem`),
 * 하단 CTA 로 바로 주문(`onOrder`)한다. 슬라이드/드래그/닫기는 `BottomSheet` 가 처리.
 */
export interface CartRecommendSheetProps {
  open: boolean;
  onClose: () => void;
  items: RecommendProductView[];
  /** 주문 금액(원). */
  totalPrice: number;
  onOrder: () => void;
  onAddItem: (id: string) => void;
}

export function CartRecommendSheet({
  open,
  onClose,
  items,
  totalPrice,
  onOrder,
  onAddItem,
}: CartRecommendSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      ariaLabel="함께 구매하면 좋은 상품"
      footer={
        <CartOrderBar
          totalPrice={totalPrice}
          onOrder={onOrder}
          className="border-t border-neutral-200"
        />
      }
    >
      <h2 className="text-heading-1 text-fg px-4 pt-1 pb-3">함께 구매하면 좋은 상품들이에요!</h2>
      <ul className="flex flex-col gap-3 px-4 pb-4">
        {items.map((item) => (
          <li key={item.id}>
            <CartRecommendItemRow
              name={item.name}
              imageSrc={item.imageSrc}
              price={item.price}
              discountPercent={item.discountPercent}
              onAdd={() => onAddItem(item.id)}
            />
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
}
