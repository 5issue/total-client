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

import { MOCK_MULTI_OPTION_PROMOTION } from './mock';

const ADD_TO_CART_ERROR_TOAST_DURATION_MS = 3000;
const ADD_TO_CART_ERROR_MESSAGE = '장바구니 담기에 실패했어요. 다시 시도해주세요.';

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
 *
 * `status === 'SOLDOUT'`인 옵션은 `CartQuantityRow`를 비활성 상태로 그려 수량을 못
 * 바꾸게 막고, 합계(`totalQuantity`)에서도 제외한다(코드래빗 리뷰 반영) — `HIDDEN`은
 * 별도 취급 규칙이 저장소에 없어 이번 변경에서 새로 정의하지 않는다(SALE과 동일 취급).
 *
 * "담기"는 `useAddCartItems`로 수량을 선택한 옵션들을 한 번에 담는다(`POST /api/cart/items`
 * 의 `items` 배열이 다건을 받는다). 성공해야만 시트를 닫고 `onAddToCart`를 호출 — 실패하면
 * 선택 상태를 유지한 채 에러 토스트만 띄운다.
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
  const addCartItems = useAddCartItems();
  const { visible: errorToastVisible, trigger: triggerErrorToast } = useTimedToast(
    ADD_TO_CART_ERROR_TOAST_DURATION_MS,
  );

  const totalQuantity = units
    .filter((unit) => unit.status !== 'SOLDOUT')
    .reduce((sum, unit) => sum + (quantities[unit.id] ?? 0), 0);

  function handleAddToCart() {
    if (totalQuantity === 0) return;
    const items = units
      .map((unit) => ({ productId: unit.id, quantity: quantities[unit.id] ?? 0 }))
      .filter((item) => item.quantity > 0);

    addCartItems.mutate(
      { items },
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
        ariaLabel="옵션 선택"
        footer={
          <>
            <div className="border-border mx-4 mb-3 border-t" />
            <AddToCartActions
              promotion={MOCK_MULTI_OPTION_PROMOTION}
              liked={liked}
              onToggleLike={() => setLiked((prev) => !prev)}
              onAddToCart={handleAddToCart}
              addToCartDisabled={totalQuantity === 0 || addCartItems.isPending}
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
          const isSoldOut = unit.status === 'SOLDOUT';
          return (
            <div key={unit.id}>
              <div className="px-4 py-3">
                <CartQuantityRow
                  name={isSoldOut ? `${unit.name} (품절)` : unit.name}
                  priceLabel={formatPrice(unit.salePrice)}
                  originalPriceLabel={hasDiscount ? formatPrice(unit.price) : undefined}
                  quantity={quantities[unit.id] ?? 0}
                  onQuantityChange={(value) =>
                    setQuantities((prev) => ({ ...prev, [unit.id]: value }))
                  }
                  min={0}
                  disabled={isSoldOut}
                />
              </div>
              {i < units.length - 1 ? <div className="border-border mx-4 border-t" /> : null}
            </div>
          );
        })}
      </BottomSheet>
    </>
  );
}
