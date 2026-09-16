'use client';

import { useState } from 'react';

import { AddToCartActions } from '@/components/molecules/product/AddToCartActions';
import { CartItemPreview } from '@/components/molecules/product/CartItemPreview';
import { CartQuantityRow } from '@/components/molecules/product/CartQuantityRow';
import { BottomSheet } from '@/components/molecules/shared/BottomSheet';
import { MembershipPromotionModal } from '@/components/organisms/product/MembershipPromotionModal';

import { MOCK_MULTI_OPTION_PRODUCT, MOCK_MULTI_OPTION_PROMOTION, MOCK_MULTI_OPTIONS } from './mock';

/**
 * 다중 옵션 상품의 수량/옵션 선택 바텀시트 (organism). Figma "5팀 UI 공유용"
 * `MultiOptionSelectBottomSheet`(node 665:43562) — 옵션마다 별도 수량 스테퍼를 갖는다.
 *
 * `ProductOptionSheet`(단일 옵션)와 셸은 동일(`BottomSheet` + `CartItemPreview` +
 * `AddToCartActions`)하되, 옵션 줄마다 `CartQuantityRow`를 반복하고(`min={0}` — 옵션은
 * 미선택 상태로 시작할 수 있다, 단일 상품 담기와 달리 "0개"가 유효한 초기값) 옵션 사이에도
 * 구분선이 들어간다. 옵션에 `badgeLabel="멤버스"`(멤버십 전용 옵션 표시).
 *
 * 담기 버튼 활성/비활성(선택 수량 0일 때)은 Figma 정적 목업에 표시가 없어(버튼이 항상
 * 기본 상태) 구현하지 않았다 — 필요하면 디자인 확인 후 추가.
 *
 * `badgeLabel`(멤버스)이 붙은 옵션은 수량을 늘리려는 시도(+ 클릭) 자체를 가로채
 * `MembershipPromotionModal` 을 띄운다 — 실제 증가는 커밋하지 않는다(가입 전까지는
 * 멤버스 전용 옵션을 담을 수 없다는 뜻). 감소/일반 옵션 증가는 그대로 통과.
 * (사용자 확인 2026-09-16: 일반 상품→단일 옵션 시트, 멤버스특가 상품→이 다중 옵션
 * 시트, 그 안에서 멤버스 옵션 + 클릭 시 가입 모달.)
 */
export type MultiOptionSelectBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  /** 담기 성공 직후(시트가 닫히는 시점) 호출 — 완료 시트 등 다음 단계 트리거용. */
  onAddToCart?: () => void;
};

export function MultiOptionSelectBottomSheet({
  open,
  onClose,
  onAddToCart,
}: MultiOptionSelectBottomSheetProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(MOCK_MULTI_OPTIONS.map((option) => [option.id, 0])),
  );
  const [liked, setLiked] = useState(false);
  const [membershipModalOpen, setMembershipModalOpen] = useState(false);

  function handleAddToCart() {
    onClose();
    onAddToCart?.();
  }

  function changeQuantity(option: (typeof MOCK_MULTI_OPTIONS)[number], value: number) {
    const current = quantities[option.id] ?? 0;
    if (option.badgeLabel && value > current) {
      setMembershipModalOpen(true);
      return;
    }
    setQuantities((prev) => ({ ...prev, [option.id]: value }));
  }

  return (
    <>
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
            />
          </>
        }
      >
        <CartItemPreview
          imageAlt=""
          name={MOCK_MULTI_OPTION_PRODUCT.name}
          tagline={MOCK_MULTI_OPTION_PRODUCT.tagline}
        />
        {/* 첫 구분선만 mt-3 필요 — CartItemPreview 는 자체 하단 여백이 없다. 이후
            구분선은 앞 옵션 줄의 py-3 하단 패딩이 이미 12px 여백을 주므로 마진 없이. */}
        <div className="border-border mx-4 mt-3 border-t" />
        {MOCK_MULTI_OPTIONS.map((option, i) => (
          <div key={option.id}>
            <div className="px-4 py-3">
              <CartQuantityRow
                badgeLabel={option.badgeLabel}
                name={option.name}
                priceLabel={option.priceLabel}
                originalPriceLabel={option.originalPriceLabel}
                unitPriceLabel={option.unitPriceLabel}
                quantity={quantities[option.id] ?? 0}
                onQuantityChange={(value) => changeQuantity(option, value)}
                min={0}
              />
            </div>
            {i < MOCK_MULTI_OPTIONS.length - 1 ? (
              <div className="border-border mx-4 border-t" />
            ) : null}
          </div>
        ))}
      </BottomSheet>

      <MembershipPromotionModal
        open={membershipModalOpen}
        onClose={() => setMembershipModalOpen(false)}
      />
    </>
  );
}
