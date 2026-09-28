'use client';

import { useState } from 'react';

import { AddToCartActions } from '@/components/molecules/product/AddToCartActions';
import { CartItemPreview } from '@/components/molecules/product/CartItemPreview';
import { CartQuantityRow } from '@/components/molecules/product/CartQuantityRow';
import { BottomSheet } from '@/components/molecules/shared/BottomSheet';
import { ErrorToastBanner } from '@/components/molecules/shared/ErrorToastBanner';
import { useAddCartItems } from '@/hooks/cart/useAddCartItems';
import { useProductDetail } from '@/hooks/product/useProductDetail';
import { useTimedToast } from '@/hooks/useTimedToast';

import type { FridgeItem } from './model';

const ADD_TO_CART_ERROR_TOAST_DURATION_MS = 3000;
const ADD_TO_CART_ERROR_MESSAGE = '장바구니 담기에 실패했어요. 다시 시도해주세요.';

/**
 * "채워넣기" 담기 바텀시트 (organism). Figma "5팀 UI 공유용"
 * `MultiOptionSelectBottomSheet`(node 1206-109860) — 일반가/멤버스가 두 줄을 독립된
 * 수량 스테퍼와 함께 보여준다. 멤버스 줄이 일반가 줄보다 위에 오고, 두 줄의 취소선
 * 가격은 항상 같은 숫자(정가, `item.originalPriceLabel` 없으면 `item.priceLabel`)를
 * 가리켜야 한다(node 1206-109860 실측, #111 QA). 단위가 표기·신선구독 버튼·약관
 * 문구는 이 시트엔 없다.
 *
 * `#101` 브랜치의 `MultiOptionSelectBottomSheet`/`MembershipPromotionModal` 은 통째로
 * 가져오지 않고, develop 기존 컴포넌트(`CartItemPreview`+`CartQuantityRow`+
 * `AddToCartActions`)만으로 조합했다 — 멤버스 가입 유도 모달은 이번 스펙 범위 밖.
 *
 * `item` 은 닫히는 트랜지션 중에도 `null` 로 비우면 안 된다 — `BottomSheet` 가
 * `open=false` 에도 children 을 마운트해두기 때문. 같은 이유로 수량 state 도 컴포넌트가
 * 언마운트되지 않아 다음 상품을 열 때 이전 값이 남는다 — `open` 이 true 로 바뀔 때마다
 * 초기값으로 재설정한다(코드래빗 리뷰, #111). `useEffect` 로 하면 리렌더 한 번을 더
 * 유발해(`react-hooks/set-state-in-effect`) 렌더 중 `prevOpen` 비교로 직접 처리한다
 * (React 공식 "You Might Not Need an Effect" 패턴).
 *
 * 총 수량이 0이면 "장바구니 담기"를 `addToCartDisabled` 로 비활성화한다 — 예전엔
 * 클릭이 되지만 핸들러 안에서 조용히 무시했다(코드래빗 리뷰, #111).
 *
 * `item.productId`는 대표상품(GROUP) id라 그대로 장바구니에 못 담는다 — 실제
 * 구매단위(UNIT) id가 필요해 `useProductDetail`로 상세를 조회해 `units[0]`을 쓴다
 * (product-service 계약, ProductOptionSheet와 동일 패턴). "멤버스"/일반가 두 줄은
 * 실제로는 같은 상품의 표시 전용 분리라 수량만 합산해 하나로 담는다(멤버십 전용
 * SKU가 따로 없음, 이슈 #145).
 */
export interface FridgeRefillBottomSheetProps {
  open: boolean;
  item: FridgeItem | null;
  onClose: () => void;
  onAddToCart: () => void;
}

export function FridgeRefillBottomSheet({
  open,
  item,
  onClose,
  onAddToCart,
}: FridgeRefillBottomSheetProps) {
  const [regularQty, setRegularQty] = useState(1);
  const [memberQty, setMemberQty] = useState(0);
  const [liked, setLiked] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setRegularQty(1);
      setMemberQty(0);
      setLiked(false);
    }
  }

  const { data: detail } = useProductDetail(item?.productId ?? '', open && Boolean(item));
  const addCartItems = useAddCartItems();
  const { visible: errorToastVisible, trigger: triggerErrorToast } = useTimedToast(
    ADD_TO_CART_ERROR_TOAST_DURATION_MS,
  );

  if (!item) return null;

  const totalQuantity = regularQty + memberQty;
  const unitId = detail?.units[0]?.id;

  function handleAddToCart() {
    if (unitId === undefined) return;
    addCartItems.mutate(
      { items: [{ productId: unitId, quantity: totalQuantity }] },
      {
        onSuccess: () => onAddToCart(),
        onError: () => triggerErrorToast(),
      },
    );
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      ariaLabel="채워넣기"
      footer={
        <>
          <ErrorToastBanner visible={errorToastVisible}>
            {ADD_TO_CART_ERROR_MESSAGE}
          </ErrorToastBanner>
          <div className="border-border mx-4 mb-3 border-t" />
          <AddToCartActions
            liked={liked}
            onToggleLike={() => setLiked((prev) => !prev)}
            showSubscribeButton={false}
            showTerms={false}
            addToCartDisabled={
              totalQuantity === 0 || unitId === undefined || addCartItems.isPending
            }
            onAddToCart={handleAddToCart}
          />
        </>
      }
    >
      <CartItemPreview
        imageSrc={item.imageSrc}
        imageAlt=""
        name={item.name}
        tagline={item.tagline}
      />
      <div className="border-border mx-4 border-t" />
      <div className="px-4 py-3">
        <CartQuantityRow
          badgeLabel="멤버스"
          name={item.name}
          priceLabel={item.memberPriceLabel}
          originalPriceLabel={item.originalPriceLabel ?? item.priceLabel}
          quantity={memberQty}
          onQuantityChange={setMemberQty}
          min={0}
        />
      </div>
      <div className="border-border mx-4 border-t" />
      <div className="px-4 py-3">
        <CartQuantityRow
          name={item.name}
          priceLabel={item.priceLabel}
          originalPriceLabel={item.originalPriceLabel}
          quantity={regularQty}
          onQuantityChange={setRegularQty}
          min={0}
        />
      </div>
    </BottomSheet>
  );
}
