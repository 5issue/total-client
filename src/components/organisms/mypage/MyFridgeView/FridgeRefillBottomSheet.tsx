'use client';

import { useState } from 'react';

import { AddToCartActions } from '@/components/molecules/product/AddToCartActions';
import { CartItemPreview } from '@/components/molecules/product/CartItemPreview';
import { CartQuantityRow } from '@/components/molecules/product/CartQuantityRow';
import { BottomSheet } from '@/components/molecules/shared/BottomSheet';

import type { FridgeItem } from './model';

/**
 * "채워넣기" 담기 바텀시트 (organism). Figma "5팀 UI 공유용"
 * `MultiOptionSelectBottomSheet`(node 1206-109860, 셸은 디자인 시스템 node
 * 3112-3251) — 일반가/멤버스가 두 줄을 독립된 수량 스테퍼와 함께 보여준다("옵션"이
 * 상품 변형이 아니라 가격 등급인 변형). 신선구독 버튼·약관 고지 문구는 없다.
 *
 * 순서·가격 표기는 node 1206-109860 실측(`Slot` 두 개, 뱃지 있는 `BottomSheetCartItem`
 * node 3112-3175가 먼저) 그대로: **멤버스가 일반가보다 위**. 두 줄의 취소선 가격은
 * 서로 달라선 안 된다 — 둘 다 "정가/원래 가격"(`item.originalPriceLabel`, 없으면
 * `item.priceLabel`)을 가리키는 같은 숫자다(실측 141,050/217,000 vs 145,000/217,000,
 * #111 QA). 단위가("100g 당 ~원") 줄은 이 시트에는 없다(`ProductOptionSheet` 전용).
 *
 * `#101` 브랜치의 `MultiOptionSelectBottomSheet`/`MembershipPromotionModal` 은 통째로
 * 가져오지 않았다 — 멤버스 미가입 시 가입 유도 모달을 띄우는 흐름은 이번 스펙에
 * 없고(가격 표기만 필요), 그 컴포넌트들은 develop 에 없는 별도 PR 의존성이라
 * 최소 셸(`CartItemPreview`+`CartQuantityRow`+`AddToCartActions`, 전부 develop 기존
 * 컴포넌트)만으로 조합했다.
 *
 * `item` 은 처음 열린 뒤로는 부모가 계속 이전 값을 들고 있는다(다음 아이템을 열 때만
 * 교체) — `BottomSheet` 는 `open=false` 여도 children 을 마운트한 채 트랜지션하므로,
 * 닫히는 도중 `item` 이 `null` 이 되면 애니메이션 중에 내용이 사라진다.
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
