import { ProductCardSkeleton } from '@/components/molecules/product/ProductCardSkeleton';

const SECTION_COUNT = 3;
const CARDS_PER_SECTION = 4;

const PULSE_BLOCK = 'bg-surface-secondary animate-pulse rounded-sm';

/**
 * `useHomeRecommendations` pending 상태용 홈 진열 placeholder.
 * `DisplaySectionList`와 같은 섹션 간격·가로 스크롤 행을 흉내 낸다.
 */
export function HomeProductSectionsSkeleton() {
  return (
    <div aria-busy="true" aria-label="홈 상품 목록 불러오는 중" className="flex flex-col">
      {Array.from({ length: SECTION_COUNT }, (_, sectionIndex) => (
        <section key={sectionIndex} className="flex flex-col gap-4 py-4">
          <div className="flex items-center justify-between px-4">
            <div className={`h-6 w-32 ${PULSE_BLOCK}`} />
          </div>
          <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto px-4">
            {Array.from({ length: CARDS_PER_SECTION }, (_, cardIndex) => (
              <ProductCardSkeleton key={cardIndex} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
