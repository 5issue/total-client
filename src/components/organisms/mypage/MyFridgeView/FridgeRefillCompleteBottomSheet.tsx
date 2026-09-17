'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { BottomSheet } from '@/components/molecules/shared/BottomSheet';
import { PromotionBar } from '@/components/molecules/shared/PromotionBar';

import { MOCK_FRIDGE_RECOMMENDED_PRODUCTS } from './mock';

/**
 * "채워넣기" 담기 완료 바텀시트 (organism). Figma "5팀 디자인 시스템"
 * `CartAddedProductsBottomSheet`(node 3119-3924) — 상단 확인 블록(프로모션
 * 배너 + "장바구니에 상품을 담았어요." + 바로가기) + "함께 구매하면 좋을 상품" 캐러셀
 * (카드 단독 스펙은 `VerticalProductCardM`, node 3119-3760).
 *
 * 추천 카드는 이 브랜치 `molecules/product/ProductCard`(150×428px 고정, 리뷰 수 필수)와
 * 스펙이 달라(120×160px, 리뷰 없음) 재사용하지 않고 이 시트 전용 카드로 둔다 —
 * `#101` 브랜치의 `size="compact"` 변형은 아직 develop 에 없다.
 *
 * `PromotionBar` 는 이 브랜치 기준 상단만 둥근 기본 모양(`rounded-t-lg`)만 지원한다
 * (4면 둥근 인라인 배너용 override prop 은 아직 없음) — 이 화면에서는 배너가 맨 위라
 * 시각 차이가 미미해 그대로 둔다.
 *
 * 캐러셀의 `overflow-x-auto` 플렉스 박스는 트레일링(우측) `padding` 이 스크롤 시
 * 사라지는 플렉스박스 공통 버그가 있어(마지막 카드가 화면 끝에 딱 붙어 "잘린" 것처럼
 * 보임, #111 QA) 우측은 `padding` 대신 `gap`+spacer 로 폭을 확보한다.
 */
export interface FridgeRefillCompleteBottomSheetProps {
  open: boolean;
  onClose: () => void;
}

function RecommendedProductCard({
  product,
}: {
  product: (typeof MOCK_FRIDGE_RECOMMENDED_PRODUCTS)[number];
}) {
  return (
    <div className="flex w-30 shrink-0 flex-col items-start gap-1">
      <div className="bg-surface-secondary relative h-40 w-30 overflow-hidden rounded-sm">
        <Image
          src={product.imageSrc}
          alt={product.imageAlt}
          fill
          sizes="120px"
          className="object-cover"
        />
        {product.couponLabel ? (
          <span className="bg-cyan absolute top-2 left-2 inline-flex items-center justify-center rounded-sm p-1">
            <span className="font-numeric text-caption-s font-bold text-white">
              {product.couponLabel}
            </span>
          </span>
        ) : null}
      </div>
      <button
        type="button"
        aria-label={`${product.name} 담기`}
        className="text-label-l text-fg active:bg-surface-secondary flex h-8 w-full items-center justify-center gap-1 rounded-sm border border-neutral-400"
      >
        <Icon name="cart" size={20} aria-hidden />
        담기
      </button>
      <div className="flex w-full flex-col">
        <p className="text-caption-m text-fg-secondary">{product.deliveryLabel}</p>
        <p className="text-body-m text-fg line-clamp-2">{product.name}</p>
        {product.originalPriceLabel ? (
          <p className="text-caption-m text-fg-quaternary font-bold line-through">
            {product.originalPriceLabel}
          </p>
        ) : null}
        <div className="flex items-center gap-1">
          {product.discountLabel ? (
            <span className="text-numeric-m font-numeric text-orange">{product.discountLabel}</span>
          ) : null}
          <span className="text-numeric-m font-numeric text-fg">{product.priceLabel}</span>
        </div>
      </div>
    </div>
  );
}

export function FridgeRefillCompleteBottomSheet({
  open,
  onClose,
}: FridgeRefillCompleteBottomSheetProps) {
  const router = useRouter();

  return (
    <BottomSheet open={open} onClose={onClose} ariaLabel="장바구니 담기 완료">
      <div className="border-border mt-1.25 flex flex-col items-center gap-1.25 border-b pb-3">
        <div className="w-full px-4">
          <PromotionBar
            text="방금 담은 상품, 지금 사면 "
            emphasisText="무료배송!"
            className="w-full"
          />
        </div>
        <div className="flex h-17.5 w-full items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="bg-surface-secondary rounded-m relative size-12.5 shrink-0 overflow-hidden" />
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
        <div className="scrollbar-hide flex items-start gap-2 overflow-x-auto pl-4">
          {MOCK_FRIDGE_RECOMMENDED_PRODUCTS.map((product) => (
            <RecommendedProductCard key={product.id} product={product} />
          ))}
          <div className="w-2 shrink-0" aria-hidden />
        </div>
      </div>
    </BottomSheet>
  );
}
