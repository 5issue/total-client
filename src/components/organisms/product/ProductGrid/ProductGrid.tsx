'use client';

import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Icon } from '@/components/atoms/Icon';
import { ProductCard } from '@/components/molecules/product/ProductCard';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import { filterProducts, useProducts, type ProductQuickFilters } from '@/hooks/product/useProducts';
import type { ProductListParams } from '@/types/product';

/**
 * 검색 결과 상품 카드 그리드 (organism, Figma node 882-60583). `useProducts` 를 직접
 * 호출해 로딩·에러·빈 상태까지 이 컨테이너가 책임진다(api-convention §8).
 *
 * 고정폭 카드 + `flex-wrap` 이 아니라 `grid-cols-2` 다 — Figma 402px 실측(180px 두 장)을
 * 고정폭으로 옮기면 그보다 좁은 실기기(390px 등)에서 폭 합이 컨테이너를 넘겨 1열로
 * 깨진다(#90 실기기 QA 재현). 종횡비는 카드의 `aspect-3/4` 가 유지한다.
 *
 * `filters`(Kurly Only/멤버스혜택/쿠폰)는 쿼리 파라미터가 아니라 응답을 받은 뒤
 * `filterProducts` 로 좁힌다 — 필터 API 가 아직 없어서다(#90). 전부 걸러지면 빈 상태
 * (node 882-60444 "EmptyStateView")가 뜬다.
 */
export interface ProductGridProps {
  query: string;
  sort?: ProductListParams['sort'];
  /** Kurly Only/멤버스혜택/쿠폰 퀵필터 칩 상태 — 미지정 시 전부 미적용. */
  filters?: ProductQuickFilters;
  onAddToCart?: (productId: string) => void;
  /** 빈 상태(Figma node 882-60444 "EmptyStateView")의 "필터 초기화" 버튼 클릭 시 호출. */
  onResetFilters?: () => void;
  className?: string;
}

const NO_FILTERS: ProductQuickFilters = {
  kurlyOnly: false,
  coupon: false,
  membershipBenefit: false,
};

export function ProductGrid({
  query,
  sort,
  filters = NO_FILTERS,
  onAddToCart,
  onResetFilters,
  className,
}: ProductGridProps) {
  const { data, isPending, isError } = useProducts({ query, sort });

  if (isPending) {
    return (
      <p className="text-label-m text-fg-tertiary w-full px-4 py-8 text-center">
        상품을 불러오는 중이에요
      </p>
    );
  }

  if (isError) {
    return (
      <ErrorState
        className="px-4 py-8"
        icon={<Icon name="alert" size={56} aria-hidden />}
        title="상품을 불러오지 못했어요"
        description="잠시 후 다시 시도해주세요"
      />
    );
  }

  const items = filterProducts(data.items, filters);

  if (items.length === 0) {
    return (
      <ErrorState
        className="flex h-79 flex-col items-center justify-center px-4"
        icon={<Icon name="alert" size={56} aria-hidden />}
        title="선택하신 필터와 일치하는 상품이 없어요."
        action={
          <FloatingButton variant="primary" icon="refresh" onClick={onResetFilters}>
            필터 초기화
          </FloatingButton>
        }
      />
    );
  }

  return (
    <div
      className={['grid grid-cols-2 gap-x-2.5 gap-y-2 px-4 py-2', className]
        .filter(Boolean)
        .join(' ')}
    >
      {items.map((item) => (
        <ProductCard
          key={item.id}
          imageSrc={item.thumbnailUrl}
          name={item.name}
          price={item.price}
          originalPrice={item.originalPrice}
          discountRate={item.discountRate}
          reviewCount={item.reviewCount}
          deliveryType={item.deliveryType}
          couponBadgeLabel={item.couponBadgeLabel}
          kurlyOnly={item.kurlyOnly}
          onAddToCart={() => onAddToCart?.(item.id)}
        />
      ))}
    </div>
  );
}
