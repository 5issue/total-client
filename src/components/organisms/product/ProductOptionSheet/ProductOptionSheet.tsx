'use client';

import { useState } from 'react';

import { AddToCartActions } from '@/components/molecules/product/AddToCartActions';
import { CartItemPreview } from '@/components/molecules/product/CartItemPreview';
import { CartQuantityRow } from '@/components/molecules/product/CartQuantityRow';
import { BottomSheet } from '@/components/molecules/shared/BottomSheet';
import { ErrorToastBanner } from '@/components/molecules/shared/ErrorToastBanner';
import { useAddCartItems } from '@/hooks/cart/useAddCartItems';
import { useTimedToast } from '@/hooks/useTimedToast';
import { formatPrice } from '@/lib/formatters';
import type { ProductUnit } from '@/types/product';

import { MOCK_ADD_TO_CART_PROMOTION } from './mock';

const ADD_TO_CART_ERROR_TOAST_DURATION_MS = 3000;
const ADD_TO_CART_ERROR_MESSAGE = '장바구니 담기에 실패했어요. 다시 시도해주세요.';

/**
 * 장바구니 담기 바텀시트 (organism). Figma `BottomSheet`(node 2888:2738) —
 * 홈 화면 상품 카드 "담기" 클릭 시 뜬다(node 838:65977).
 *
 * `molecules/shared/BottomSheet` 셸을 그대로 쓰고, 본문은 스크롤 영역(children),
 * CTA(`AddToCartActions`)는 `footer` 슬롯(스크롤 밖 고정)에 넣는다. 구분선은
 * Figma 원본대로 2개 — 두 번째는 `footer` 슬롯 맨 위에 둬서, 본문이 길어져
 * 스크롤돼도 CTA 경계선은 고정 영역에 남게 한다.
 *
 * 수량 조절은 로컬 state. `persistToCart`(기본 true)이면 "담기"가
 * `useAddCartItems`로 `POST /api/cart/items`를 호출하고, 성공해야만 시트를 닫고
 * `onAddToCart`로 알린다(호출부가 `CartAddedProductsBottomSheet`를 잇달아 여는 데 쓴다,
 * node 665:43409) — 실패하면 시트를 열어둔 채 에러 토스트만 띄운다(입력값 보존).
 * 홈처럼 mock SKU를 넘기는 호출부는 `persistToCart={false}`로 실제 POST를 끈다.
 * 신선구독/찜은 아직 뮤테이션 API가 없어 UI만.
 *
 * `unit`(이슈 #134) — 상품 상세 응답의 SKU가 정확히 1개일 때 셸이 이 시트를 연다(2개
 * 이상이면 `MultiOptionSelectBottomSheet`). 홈 화면처럼 어떤 카드를 눌렀는지 아직 알 수
 * 없는 호출부는 `mock.ts` 픽스처를 그대로 넘긴다. 단위가(`unitPriceLabel`)는 계약에
 * 없어 렌더하지 않는다. `unit.status === 'SOLDOUT'`이면 담기를 막는다(코드래빗 리뷰
 * 반영 — 상품은 SALE이어도 유일한 unit이 품절일 수 있다).
 */
export type ProductOptionSheetProps = {
  open: boolean;
  onClose: () => void;
  /** 담기 성공 직후(시트가 닫히는 시점) 호출 — 완료 시트 등 다음 단계 트리거용. */
  onAddToCart?: () => void;
  productName: string;
  productTagline: string;
  productImageSrc?: string;
  unit: ProductUnit;
  /**
   * false면 CTA가 POST 없이 시트만 닫는다. 홈/스토리처럼 `mock.ts` 픽스처 SKU
   * (`id: 1`)를 넘기는 호출부 전용 — 기본 true(상품 상세의 실 SKU).
   */
  persistToCart?: boolean;
};

export function ProductOptionSheet({
  open,
  onClose,
  onAddToCart,
  productName,
  productTagline,
  productImageSrc,
  unit,
  persistToCart = true,
}: ProductOptionSheetProps) {
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const hasDiscount = unit.price !== unit.salePrice;
  const isSoldOut = unit.status === 'SOLDOUT';
  const addCartItems = useAddCartItems();
  const { visible: errorToastVisible, trigger: triggerErrorToast } = useTimedToast(
    ADD_TO_CART_ERROR_TOAST_DURATION_MS,
  );

  function handleAddToCart() {
    if (isSoldOut) return;
    if (!persistToCart) {
      onClose();
      onAddToCart?.();
      return;
    }
    addCartItems.mutate(
      { items: [{ productId: unit.id, quantity }] },
      {
        onSuccess: () => {
          onClose();
          onAddToCart?.();
        },
        onError: () => {
          triggerErrorToast();
        },
      },
    );
  }

  return (
    <>
      {/* BottomSheet 바깥에 둔다 — footer 슬롯은 시트 슬라이드용 translate-y-* 조상
          안이라, position:fixed인 이 토스트를 그 안에 넣으면 그 조상이 containing
          block이 돼버려 화면 최상단이 아니라 시트 근처 좌표에 렌더된다(실패하지
          않았는데도 시트를 열자마자 보이는 버그, MyFridgeView/FridgeRefillBottomSheet
          에서 동일 패턴으로 먼저 발견·수정). */}
      <ErrorToastBanner visible={errorToastVisible}>{ADD_TO_CART_ERROR_MESSAGE}</ErrorToastBanner>
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
              onAddToCart={handleAddToCart}
              addToCartDisabled={isSoldOut || (persistToCart && addCartItems.isPending)}
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
        {/* mt-3: OptionSelectBottomSheet(node 665:43255)는 직계 자식 전부를 gap-s(12px)로
            쌓는데, 이 구분선 앞에서만 그 12px이 비어 있었다(실측 재확인, 버그) —
            미리보기 바로 아래 구분선이 붙어 보였다. */}
        <div className="border-border mx-4 mt-3 border-t" />
        <div className="px-4 py-3">
          <CartQuantityRow
            name={isSoldOut ? `${unit.name} (품절)` : unit.name}
            priceLabel={formatPrice(unit.salePrice)}
            originalPriceLabel={hasDiscount ? formatPrice(unit.price) : undefined}
            quantity={quantity}
            onQuantityChange={setQuantity}
            disabled={isSoldOut}
          />
        </div>
      </BottomSheet>
    </>
  );
}
