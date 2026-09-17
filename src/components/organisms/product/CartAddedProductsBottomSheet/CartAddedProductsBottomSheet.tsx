'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/Button';
import { ProductCard } from '@/components/molecules/product/ProductCard';
import { BottomSheet } from '@/components/molecules/shared/BottomSheet';
import { PromotionBar } from '@/components/molecules/shared/PromotionBar';

import { MOCK_RECOMMENDED_PRODUCTS } from './mock';

/**
 * 장바구니 담기 완료 바텀시트 (organism). Figma "5팀 UI 공유용"
 * `CartAddedProductsBottomSheet`(node 665:43409) — 담기 성공 직후 뜬다(호출부가
 * 옵션 시트를 닫으면서 이 시트를 연다).
 *
 * 이미지 영역 없이 428px 고정이던 홈 카드와 달리 이 시트의 추천 카드는 폭 120px·
 * 이미지 160px·리뷰 없음이라 `ProductCard`(molecule)의 `size="compact"`로 재사용
 * (ProductCard.tsx 주석 참고). "바로가기"는 `Button`(`variant="outlineBlack"
 * size="xs"`)가 이 칩과 테두리색·radius(8px)·높이(32px)가 정확히 일치해 그대로 썼다
 * (텍스트만 15→14px, 무시할 수준 차이).
 *
 * 상단 프로모션 배너는 `PromotionBar` 재사용 — 다만 이 시트에서는 4면 다 둥글고
 * 좌우 여백이 있는 인라인 배너라 `roundedClassName="rounded-m"` 로 override.
 */
export type CartAddedProductsBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  onAddRecommended?: (productId: string) => void;
};

export function CartAddedProductsBottomSheet({
  open,
  onClose,
  onAddRecommended,
}: CartAddedProductsBottomSheetProps) {
  const router = useRouter();

  return (
    <BottomSheet open={open} onClose={onClose} ariaLabel="장바구니 담기 완료">
      {/* mt-1.25(5px): Main Container(node I665:43409;3119:3919)는 핸들까지 포함해 직계
          자식 전부를 gap-[5px]로 쌓는데, 핸들은 BottomSheet 몫이라 여기서 첫 자식
          위에 그만큼만 별도로 얹는다. */}
      <div className="border-border mt-1.25 flex flex-col items-center gap-1.25 border-b pb-3">
        {/* PromotionBar 자체엔 폭 클래스가 없어(하그 콘텐츠) 좌우 16px 인셋만 주면
            텍스트 길이만큼만 좁게 렌더됐다 — 패딩으로 인셋을 만드는 바깥 div 를 두고
            PromotionBar 는 그 안에서 w-full 로 채운다(마진+w-full 조합은 오버플로우
            위험이 있어 패딩 기반으로 변경, 실기기 QA 발견). */}
        <div className="w-full px-4">
          <PromotionBar
            text="방금 담은 상품, 지금 사면 "
            emphasisText="무료배송!"
            roundedClassName="rounded-m"
            className="w-full"
          />
        </div>
        <div className="flex h-17.5 w-full items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="bg-surface-secondary rounded-m relative size-12.5 shrink-0 overflow-hidden">
              {/* 담긴 상품 이미지 — 백엔드 연동 전까지 회색 박스(다른 이미지 슬롯과 동일 관례). */}
            </div>
            <p className="text-body-l text-fg">장바구니에 상품을 담았어요.</p>
          </div>
          <Button
            variant="outlineBlack"
            size="xs"
            onClick={() => router.push('/cart')}
            className="w-18.25"
          >
            바로가기
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 py-2">
        <p className="text-body-l text-fg px-4 py-2.5">함께 구매하면 좋을 상품</p>
        <div className="scrollbar-hide flex items-start gap-2 overflow-x-auto px-4">
          {MOCK_RECOMMENDED_PRODUCTS.map((product) => (
            <ProductCard
              key={product.id}
              size="compact"
              imageSrc={product.imageSrc}
              imageAlt={product.imageAlt}
              deliveryLabel={product.deliveryLabel}
              name={product.name}
              originalPriceLabel={product.originalPriceLabel}
              discountLabel={product.discountLabel}
              priceLabel={product.priceLabel}
              couponPercentLabel={product.couponPercentLabel}
              onAddToCart={() => onAddRecommended?.(product.id)}
            />
          ))}
        </div>
      </div>
    </BottomSheet>
  );
}
