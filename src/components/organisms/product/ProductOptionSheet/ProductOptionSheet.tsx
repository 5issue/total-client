'use client';

import { useState } from 'react';

import { AddToCartActions } from '@/components/molecules/product/AddToCartActions';
import { CartItemPreview } from '@/components/molecules/product/CartItemPreview';
import { CartQuantityRow } from '@/components/molecules/product/CartQuantityRow';
import { BottomSheet } from '@/components/molecules/shared/BottomSheet';

import { MOCK_ADD_TO_CART_PRODUCT, MOCK_ADD_TO_CART_PROMOTION } from './mock';

/**
 * 장바구니 담기 바텀시트 (organism). Figma `BottomSheet`(node 2888:2738) —
 * 홈 화면 상품 카드 "담기" 클릭 시 뜬다(node 838:65977).
 *
 * `molecules/shared/BottomSheet` 셸을 그대로 쓰고, 본문은 스크롤 영역(children),
 * CTA(`AddToCartActions`)는 `footer` 슬롯(스크롤 밖 고정)에 넣는다. 구분선은
 * Figma 원본대로 2개 — 두 번째는 `footer` 슬롯 맨 위에 둬서, 본문이 길어져
 * 스크롤돼도 CTA 경계선은 고정 영역에 남게 한다.
 *
 * 어떤 카드의 "담기"를 눌러도 `mock.ts`의 대표 상품(Figma 예시 "연세우유")으로
 * 고정 렌더한다 — 클릭한 상품별 데이터 연동은 API 연동 단계 몫. 수량 조절은
 * 로컬 state로 실제 동작하지만, 장바구니 담기/신선구독/찜은 뮤테이션 API가 아직
 * 없어 "담기" 클릭 시 시트만 닫는다.
 */
export type ProductOptionSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function ProductOptionSheet({ open, onClose }: ProductOptionSheetProps) {
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      ariaLabel="장바구니 담기"
      footer={
        <>
          {/* 위쪽 12px은 CartQuantityRow의 py-3에서 이미 확보돼 mb-3 으로 아래쪽만 맞춘다 —
              없으면 바로 아래 PromotionBar 와 붙어 안 보인다. */}
          <div className="border-border mx-4 mb-3 border-t" />
          <AddToCartActions
            promotion={MOCK_ADD_TO_CART_PROMOTION}
            liked={liked}
            onToggleLike={() => setLiked((prev) => !prev)}
            onAddToCart={onClose}
          />
        </>
      }
    >
      <CartItemPreview
        imageAlt=""
        name={MOCK_ADD_TO_CART_PRODUCT.name}
        tagline={MOCK_ADD_TO_CART_PRODUCT.tagline}
      />
      <div className="border-border mx-4 border-t" />
      <div className="px-4 py-3">
        <CartQuantityRow
          name={MOCK_ADD_TO_CART_PRODUCT.name}
          priceLabel={MOCK_ADD_TO_CART_PRODUCT.priceLabel}
          originalPriceLabel={MOCK_ADD_TO_CART_PRODUCT.originalPriceLabel}
          unitPriceLabel={MOCK_ADD_TO_CART_PRODUCT.unitPriceLabel}
          quantity={quantity}
          onQuantityChange={setQuantity}
        />
      </div>
    </BottomSheet>
  );
}
