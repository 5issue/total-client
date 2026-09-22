'use client';

import { useState } from 'react';

import { AddToCartActions } from '@/components/molecules/product/AddToCartActions';
import { CartItemPreview } from '@/components/molecules/product/CartItemPreview';
import { CartQuantityRow } from '@/components/molecules/product/CartQuantityRow';
import { BottomSheet } from '@/components/molecules/shared/BottomSheet';
import { formatPrice } from '@/lib/formatters';
import type { ProductUnit } from '@/types/product';

import { MOCK_MULTI_OPTION_PROMOTION } from './mock';

/**
 * 다중 옵션 상품의 수량/옵션 선택 바텀시트 (organism). Figma "5팀 UI 공유용"
 * `MultiOptionSelectBottomSheet`(node 665:43562) — 옵션마다 별도 수량 스테퍼를 갖는다.
 *
 * `ProductOptionSheet`(단일 옵션)와 셸은 동일(`BottomSheet` + `CartItemPreview` +
 * `AddToCartActions`)하되, 옵션 줄마다 `CartQuantityRow`를 반복하고(`min={0}` — 옵션은
 * 미선택 상태로 시작할 수 있다, 단일 상품 담기와 달리 "0개"가 유효한 초기값) 옵션 사이에도
 * 구분선이 들어간다.
 *
 * 모든 옵션이 `min={0}`이라 초기 수량 합계는 0이다 — 아무것도 선택 안 한 채 CTA를
 * 누르면 빈 담기 완료 흐름이 시작되지 않도록 수량 합계가 1 이상일 때만 담기를
 * 허용하고, 그 전에는 버튼을 비활성화한다.
 *
 * `units`(이슈 #134) — product-service 상세 응답의 SKU 목록을 그대로 옵션으로 그린다.
 * 계약에 멤버십 전용 옵션 여부·단위가(`unitPriceLabel`) 필드가 없어, 이전에 있던
 * "멤버스" 뱃지 + 가입 유도 모달(`MembershipPromotionModal`) 분기는 뗐다 — 그 필드가
 * 생기면 옵션별로 다시 판단해 되살리면 된다.
 */
export type MultiOptionSelectBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  /** 담기 성공 직후(시트가 닫히는 시점) 호출 — 완료 시트 등 다음 단계 트리거용. */
  onAddToCart?: () => void;
  productName: string;
  productTagline: string;
  productImageSrc?: string;
  units: ProductUnit[];
};

export function MultiOptionSelectBottomSheet({
  open,
  onClose,
  onAddToCart,
  productName,
  productTagline,
  productImageSrc,
  units,
}: MultiOptionSelectBottomSheetProps) {
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [liked, setLiked] = useState(false);

  const totalQuantity = Object.values(quantities).reduce((sum, q) => sum + q, 0);

  function handleAddToCart() {
    if (totalQuantity === 0) return;
    onClose();
    onAddToCart?.();
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      ariaLabel="옵션 선택"
      footer={
        <>
          <div className="border-border mx-4 mb-3 border-t" />
          <AddToCartActions
            promotion={MOCK_MULTI_OPTION_PROMOTION}
            liked={liked}
            onToggleLike={() => setLiked((prev) => !prev)}
            onAddToCart={handleAddToCart}
            addToCartDisabled={totalQuantity === 0}
          />
        </>
      }
    >
      <CartItemPreview
        imageSrc={productImageSrc}
        imageAlt=""
        name={productName}
        tagline={productTagline}
      />
      {/* 첫 구분선만 mt-3 필요 — CartItemPreview 는 자체 하단 여백이 없다. 이후
          구분선은 앞 옵션 줄의 py-3 하단 패딩이 이미 12px 여백을 주므로 마진 없이. */}
      <div className="border-border mx-4 mt-3 border-t" />
      {units.map((unit, i) => {
        const hasDiscount = unit.price !== unit.salePrice;
        return (
          <div key={unit.id}>
            <div className="px-4 py-3">
              <CartQuantityRow
                name={unit.name}
                priceLabel={formatPrice(unit.salePrice)}
                originalPriceLabel={hasDiscount ? formatPrice(unit.price) : undefined}
                quantity={quantities[unit.id] ?? 0}
                onQuantityChange={(value) =>
                  setQuantities((prev) => ({ ...prev, [unit.id]: value }))
                }
                min={0}
              />
            </div>
            {i < units.length - 1 ? <div className="border-border mx-4 border-t" /> : null}
          </div>
        );
      })}
    </BottomSheet>
  );
}
