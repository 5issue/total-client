'use client';

import { useState } from 'react';

import { AddToCartActions } from '@/components/molecules/product/AddToCartActions';
import { CartItemPreview } from '@/components/molecules/product/CartItemPreview';
import { CartQuantityRow } from '@/components/molecules/product/CartQuantityRow';
import { BottomSheet } from '@/components/molecules/shared/BottomSheet';

import type { FridgeItem } from './model';

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
 * `open=false` 에도 children 을 마운트해두기 때문.
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

  if (!item) return null;

  const totalQuantity = regularQty + memberQty;

  function handleAddToCart() {
    if (totalQuantity === 0) return;
    onAddToCart();
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      ariaLabel="채워넣기"
      footer={
        <>
          <div className="border-border mx-4 mb-3 border-t" />
          <AddToCartActions
            liked={liked}
            onToggleLike={() => setLiked((prev) => !prev)}
            showSubscribeButton={false}
            showTerms={false}
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
