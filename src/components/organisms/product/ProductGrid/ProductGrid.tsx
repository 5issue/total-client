import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Icon } from '@/components/atoms/Icon';
import { SearchResultProductCard } from '@/components/molecules/product/SearchResultProductCard';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import type { Product } from '@/types/product';

/**
 * 검색 결과 상품 카드 그리드 (organism, Figma node 882-60583) — 순수 표현 컴포넌트.
 *
 * `useProducts` 조회와 `filterProducts` 필터링은 부모 `SearchResultSection` 이 소유한다
 * (api-convention §8 — "이 훅을 소비하는 화면/organism 컨테이너"가 로딩·에러·빈 상태를
 * 정의하는 계층이지, 표현 컴포넌트가 아니다). 원래는 이 컴포넌트도 `useProducts` 를
 * 직접 호출했는데, 부모가 필터링된 개수(`filteredCount`) 때문에 이미 같은 훅을 구독하고
 * 있어 컨테이너가 둘로 쪼개져 있었다 — 같은 쿼리 키라 실제 네트워크 요청이 중복되진
 * 않지만(TanStack Query 캐시), "누가 로딩/에러/빈 상태를 책임지는가"가 두 컴포넌트에
 * 흩어지는 관심사 분리 위반이었다(#90 리뷰 반영, 2026-09-16). 지금은 이 컴포넌트가
 * `items`/`isPending`/`isError` 를 그대로 받아 렌더만 한다.
 *
 * 고정폭 카드 + `flex-wrap` 이 아니라 `grid-cols-2` 다 — Figma 402px 실측(180px 두 장)을
 * 고정폭으로 옮기면 그보다 좁은 실기기(390px 등)에서 폭 합이 컨테이너를 넘겨 1열로
 * 깨진다(#90 실기기 QA 재현). 종횡비는 카드의 `aspect-3/4` 가 유지한다.
 */
export interface ProductGridProps {
  /** 부모가 `filterProducts` 로 이미 걸러낸 목록. */
  items: Product[];
  isPending: boolean;
  isError: boolean;
  onAddToCart?: (productId: string) => void;
  /** 빈 상태(Figma node 882-60444 "EmptyStateView")의 "필터 초기화" 버튼 클릭 시 호출. */
  onResetFilters?: () => void;
  className?: string;
}

export function ProductGrid({
  items,
  isPending,
  isError,
  onAddToCart,
  onResetFilters,
  className,
}: ProductGridProps) {
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
        <SearchResultProductCard
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
