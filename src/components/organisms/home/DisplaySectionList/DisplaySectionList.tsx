'use client';

import { ProductCard, type ProductCardProps } from '@/components/molecules/product/ProductCard';
import { HomeSectionHeader } from '@/components/molecules/shared/HomeSectionHeader';

/**
 * 홈 상품 진열 섹션 — 섹션 헤더 + 상품 카드 4개 가로 스크롤 (organism).
 * Figma "HomeScreen" > "Product Section" (node 577:20681 / 577:20688 / 577:20695),
 * 홈에 3세트 반복.
 *
 * `molecules/shared/HomeSectionHeader`(`titleClassName="font-bold!"` — 이 화면은
 * 바인딩된 Medium 대신 수동 Bold 오버라이드, 최우선 순위가 필요해 `!` 필수 — 그냥
 * `font-bold` 는 `text-heading-2` 자체 font-weight 유틸리티에 밀려 적용되지 않는다)와
 * `molecules/product/ProductCard`를 그대로 조립한다. 순수 표현 컴포넌트 — 실 데이터
 * 조회(`useHomeRecommendations`)와 원시 응답→`DisplaySectionProduct` 매핑은 `HomeProductSections`가
 * 소유한다(#136).
 */
export type DisplaySectionProduct = Omit<ProductCardProps, 'onAddToCart' | 'className' | 'href'> & {
  id: string;
};

export type DisplaySectionListProps = {
  title: string;
  subtitle?: string;
  href?: string;
  products: DisplaySectionProduct[];
  onAddToCart?: (productId: string) => void;
  className?: string;
};

export function DisplaySectionList({
  title,
  subtitle,
  href,
  products,
  onAddToCart,
  className,
}: DisplaySectionListProps) {
  return (
    <section className={['flex flex-col gap-4 py-4', className].filter(Boolean).join(' ')}>
      <HomeSectionHeader
        title={title}
        subtitle={subtitle}
        href={href}
        titleClassName="font-bold!"
      />
      {/* SwipeTabShell 의 전역 좌우 스와이프(하단 탭 전환)와 충돌하지 않도록 터치 버블링을 끊는다 — TabBar 참고 */}
      <div
        onTouchStart={(event) => event.stopPropagation()}
        onTouchEnd={(event) => event.stopPropagation()}
        className="scrollbar-hide flex items-center gap-2 overflow-x-auto px-4"
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            href={`/products/${product.id}`}
            imageSrc={product.imageSrc}
            imageAlt={product.imageAlt}
            deliveryLabel={product.deliveryLabel}
            name={product.name}
            originalPriceLabel={product.originalPriceLabel}
            discountLabel={product.discountLabel}
            priceLabel={product.priceLabel}
            reviewCountLabel={product.reviewCountLabel}
            couponPercentLabel={product.couponPercentLabel}
            kurlyOnly={product.kurlyOnly}
            onAddToCart={onAddToCart ? () => onAddToCart(product.id) : undefined}
          />
        ))}
      </div>
    </section>
  );
}
