'use client';

import { ProductCard, type ProductCardProps } from '@/components/molecules/product/ProductCard';
import { HomeSectionHeader } from '@/components/molecules/shared/HomeSectionHeader';

/**
 * 홈 상품 진열 섹션 — 섹션 헤더 + 상품 카드 4개 가로 스크롤 (organism).
 * Figma "HomeScreen" > "Product Section" (node 577:20681 / 577:20688 / 577:20695),
 * 홈에 3세트 반복.
 *
 * `molecules/shared/HomeSectionHeader`(`titleWeight="bold"` — 이 화면은 바인딩된
 * Medium 대신 수동 Bold 오버라이드)와 `molecules/product/ProductCard`를 그대로
 * 조립한다. 실제 데이터는 `/products/home-recommendations` API 미확정
 * (structure-convention §6-2)이라 `mock.ts` 정적 배열만 쓴다.
 */
export type DisplaySectionProduct = Omit<ProductCardProps, 'onAddToCart' | 'className'> & {
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
      <HomeSectionHeader title={title} subtitle={subtitle} href={href} titleWeight="bold" />
      {/* SwipeTabShell 의 전역 좌우 스와이프(하단 탭 전환)와 충돌하지 않도록 터치 버블링을 끊는다 — TabBar 참고 */}
      <div
        onTouchStart={(event) => event.stopPropagation()}
        onTouchEnd={(event) => event.stopPropagation()}
        className="scrollbar-hide flex items-center gap-2 overflow-x-auto px-4"
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
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
