'use client';

import { useState } from 'react';

import { AddToCartActions } from '@/components/molecules/product/AddToCartActions';
import { CartItemPreview } from '@/components/molecules/product/CartItemPreview';
import { CartQuantityRow } from '@/components/molecules/product/CartQuantityRow';
import { BottomSheet } from '@/components/molecules/shared/BottomSheet';

/**
 * 장바구니 담기 바텀시트 (organism). Figma "5팀 디자인 시스템" >
 * `BottomSheet`(node 2888:2738) — 홈 화면 상품 카드 "담기" 클릭 시 뜬다
 * (node 838:65977, HomeScreen with BottomSheet open).
 *
 * `molecules/shared/BottomSheet` 셸(포털·포커스트랩·드래그로 닫기)을 그대로 쓰고,
 * 본문(`CartItemPreview` + `CartQuantityRow`)은 스크롤 영역에, 하단 액션
 * (`AddToCartActions`)은 `footer` 슬롯(스크롤 밖 고정)에 넣는다.
 *
 * 구분선은 Figma 원본에 2개다(Vector 18 — 미리보기/담을 상품 사이, Vector 19 —
 * 담을 상품/CTA 사이, node 3112:2649). 두 번째 구분선은 스크롤 영역이 아니라
 * `footer` 슬롯 맨 위에 둔다 — 본문이 길어져 스크롤돼도 CTA 경계선은 고정돼 있어야
 * Figma 의 "스크롤 영역 vs 고정 CTA" 구분과 일치한다.
 *
 * 이번 단계는 UI 퍼블리싱만 — 실제로는 클릭한 상품마다 다른 데이터(썸네일/가격 등)가
 * 와야 하지만, 홈 화면 12개 상품 전부에 동적 배선하는 건 API 연동 단계 몫이라
 * 대표 mock 한 세트(Figma 예시 "연세우유")로 고정 렌더한다 — 어떤 카드의 "담기"를
 * 눌러도 동일 내용이 열린다. 수량 조절은 실제로 동작(로컬 state)하지만 장바구니
 * 담기/신선구독/찜 클릭은 아직 뮤테이션 API가 없어 "담기" 클릭 시 시트만 닫는다.
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
          {/* Figma 부모 컨테이너가 형제 사이 Gap/S(12px)를 균일하게 준다 — 이 구분선은
              위(CartQuantityRow의 py-3)에서 12px을 이미 받으므로 아래쪽에만 mb-3 을
              더해 대칭을 맞춘다. 없으면 바로 아래 PromotionBar 와 붙어 안 보인다(실기기 확인). */}
          <div className="border-border mx-4 mb-3 border-t" />
          <AddToCartActions
            promotion={{ text: '첫 구매니까, 하나만 사도 ', emphasisText: '무료배송' }}
            liked={liked}
            onToggleLike={() => setLiked((prev) => !prev)}
            onAddToCart={onClose}
          />
        </>
      }
    >
      <CartItemPreview
        imageAlt=""
        name="[연세우유 x 마켓컬리] 전용목장우유 900mL"
        tagline="가격, 퀄리티 모두 만족스러운 1A등급 우유"
      />
      <div className="border-border mx-4 border-t" />
      <div className="px-4 py-3">
        <CartQuantityRow
          name="[연세우유 x 마켓컬리] 전용목장우유 900mL"
          priceLabel="2,780원"
          originalPriceLabel="3,400원"
          unitPriceLabel="100g 당 309원"
          quantity={quantity}
          onQuantityChange={setQuantity}
        />
      </div>
    </BottomSheet>
  );
}
