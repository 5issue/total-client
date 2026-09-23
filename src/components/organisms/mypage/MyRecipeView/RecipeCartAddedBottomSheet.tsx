'use client';

import { useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { BottomSheet } from '@/components/molecules/shared/BottomSheet';
import { PromotionBar } from '@/components/molecules/shared/PromotionBar';

import { MOCK_RECIPE_RECOMMENDED_PRODUCTS } from './mock';

/**
 * "장바구니 담기 완료" 시트(node 666-31809 "CartAddedProductsBottomSheet"). 내용·
 * 레이아웃이 `MyFridgeView/FridgeRefillCompleteBottomSheet`와 사실상 동일한 패턴이라
 * 그대로 미러링했다 — #112(나의 냉장고)가 아직 리뷰 중이라 그 파일을 공용으로
 * 승격하지 않고 레시피 쪽에 같은 모양으로 새로 뒀다(계획 검토 시 논의한 내용).
 */
export interface RecipeCartAddedBottomSheetProps {
  open: boolean;
  onClose: () => void;
}

function RecommendedProductCard({
  product,
  added,
  onAdd,
}: {
  product: (typeof MOCK_RECIPE_RECOMMENDED_PRODUCTS)[number];
  added: boolean;
  onAdd: () => void;
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
            <span className="font-numeric text-caption-s text-fg-inverse font-bold">
              {product.couponLabel}
            </span>
          </span>
        ) : null}
      </div>
      <button
        type="button"
        disabled={added}
        onClick={onAdd}
        aria-label={`${product.name} 담기`}
        className={[
          'border-border text-label-l flex h-8 w-full items-center justify-center gap-1 rounded-sm border',
          added ? 'text-fg-disabled' : 'text-fg active:bg-surface-secondary',
        ].join(' ')}
      >
        <Icon name="cart" size={20} aria-hidden />
        {added ? '담음' : '담기'}
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

export function RecipeCartAddedBottomSheet({ open, onClose }: RecipeCartAddedBottomSheetProps) {
  const router = useRouter();
  const [addedProductIds, setAddedProductIds] = useState<Set<string>>(new Set());

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
          <p className="text-body-l text-fg">장바구니에 상품을 담았어요.</p>
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
          {MOCK_RECIPE_RECOMMENDED_PRODUCTS.map((product) => (
            <RecommendedProductCard
              key={product.id}
              product={product}
              added={addedProductIds.has(product.id)}
              onAdd={() => setAddedProductIds((prev) => new Set(prev).add(product.id))}
            />
          ))}
          <div className="w-2 shrink-0" aria-hidden />
        </div>
      </div>
    </BottomSheet>
  );
}
