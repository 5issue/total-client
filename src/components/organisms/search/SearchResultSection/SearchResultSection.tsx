'use client';

import { useState, type ReactNode, type TouchEvent as ReactTouchEvent } from 'react';

import { FilterChip } from '@/components/atoms/FilterChip';
import { ProductGrid } from '@/components/organisms/product/ProductGrid';
import { FilterSheet } from '@/components/organisms/search/FilterSheet';
import { ListHeader } from '@/components/organisms/shared/ListHeader';
import { filterProducts, useProducts } from '@/hooks/product/useProducts';
import type { ProductListParams } from '@/types/product';

/**
 * `SwipeTabShell` 이 화면 전체의 좌우 터치를 탭 전환 제스처로 가로챈다 — 이 화면의
 * 연관 키워드 바/필터 칩 로우처럼 자체 가로 스크롤이 있는 영역은 버블링을 끊어야
 * 스크롤 제스처가 탭 전환으로 새지 않는다.
 */
const stopSwipePropagation = {
  onTouchStart: (e: ReactTouchEvent) => e.stopPropagation(),
  onTouchEnd: (e: ReactTouchEvent) => e.stopPropagation(),
  onTouchCancel: (e: ReactTouchEvent) => e.stopPropagation(),
};
const RELATED_KEYWORDS = [
  '저지방우유',
  '소화가 잘 되는 우유',
  '유기농 아몬드 우유',
  '저지방 코코넛 밀크',
  '프로틴 강화 두유',
];

const SORT_OPTIONS: { value: ProductListParams['sort']; label: string }[] = [
  { value: 'recommend', label: '추천순' },
  { value: 'new', label: '신상품순' },
  { value: 'sales', label: '판매량순' },
  { value: 'benefit', label: '혜택순' },
  { value: 'priceAsc', label: '낮은 가격순' },
  { value: 'priceDesc', label: '높은 가격순' },
];

export interface SearchResultSectionProps {
  query: string;
}

/**
 * 확장 없는 순수 토글 칩(Kurly Only·쿠폰). `FilterChip` 은 gradient 톤의 2겹 padding-box
 * 구조라 이 단순 basic 톤에는 재사용 가치가 없어 직접 마크업한다. 기본 보더 색만 서로
 * 다르고(브랜드 vs 중립, Figma node 882-60577), 선택 시엔 같은 색으로 수렴한다(node 882-60388).
 */
function ToggleChip({
  selected,
  onToggle,
  tone,
  children,
}: {
  selected: boolean;
  onToggle: () => void;
  tone: 'brand' | 'neutral';
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={[
        'text-label-m inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-full border px-3 py-2 whitespace-nowrap',
        selected
          ? 'bg-brand-50 border-brand-200 text-primary'
          : tone === 'brand'
            ? 'border-primary text-brand-secondary'
            : 'border-fg-tertiary text-brand-secondary',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

/**
 * 검색 결과 화면 본문 (organism, Figma node 882-60257). 검색창 제출이 있을 때
 * 자동완성 드롭다운 대신 렌더된다.
 *
 * - AI 연관 키워드 질문 카드는 이 화면에 없다 — 디자이너 확인: 기능 자체를 구현하지
 *   않는 전제로 처음부터 그 카드 없이 디자인됐다(node 882-60257 vs 882-60569).
 * - 연관 키워드 바는 연관 검색어 API 가 없어 Figma 목업 카피를 그대로 쓴다. 클릭 시
 *   재검색은 이번 범위 밖이라(결과 뷰 전환은 검색창 제출 하나로 좁힘, #90) 비상호작용
 *   텍스트로 둔다.
 * - 필터/카테고리 트리거는 둘 다 같은 `FilterSheet` 를 연다 — "카테고리"가 그 시트의
 *   기본 활성 탭이라 진입점을 구분하지 않는다.
 * - Kurly Only/멤버스혜택/쿠폰 토글 칩은 시각 상태(node 882-60388)뿐 아니라 실제 목록도
 *   `filterProducts` 로 좁힌다 — 백엔드 필터 API 가 없어 이미 받아온 목록을 거르는 임시
 *   구현이다(#90). 전부 걸러지면 `ProductGrid` 가 빈 상태를 보여준다.
 * - `useProducts` 는 이 컴포넌트만 구독한다(api-convention §8 — 컨테이너 계층 하나가
 *   로딩·에러·빈 상태를 책임진다) — `ProductGrid` 는 걸러진 `items`/`isPending`/`isError`
 *   를 props 로만 받는 순수 표현 컴포넌트다(#90 리뷰 반영, 2026-09-16 — 예전엔 이 화면과
 *   `ProductGrid` 가 각각 `useProducts` 를 구독해 컨테이너 책임이 둘로 쪼개져 있었다).
 */
export function SearchResultSection({ query }: SearchResultSectionProps) {
  const [sort, setSort] = useState<ProductListParams['sort']>('recommend');
  const [kurlyOnly, setKurlyOnly] = useState(false);
  const [coupon, setCoupon] = useState(false);
  const [membership, setMembership] = useState(false);
  const [isFilterSheetOpen, setFilterSheetOpen] = useState(false);
  // #128: 필터 바텀시트(가격/브랜드/유형)에서 "N개 상품보기"를 눌러야 반영되는 서버 필터.
  const [appliedFilters, setAppliedFilters] = useState<{
    brand: ProductListParams['brand'];
    price: ProductListParams['price'];
    storageType: ProductListParams['storageType'];
  }>({ brand: undefined, price: undefined, storageType: undefined });
  const { data, isPending, isError } = useProducts({ query, sort, ...appliedFilters });
  const filters = { kurlyOnly, coupon, membershipBenefit: membership };
  const items = data ? filterProducts(data.items, filters) : [];
  const filteredCount = items.length;

  const resetFilters = () => {
    setKurlyOnly(false);
    setCoupon(false);
    setMembership(false);
    // #128: 빈 상태의 "필터 초기화"는 퀵필터 칩뿐 아니라 필터 바텀시트에서 적용한
    // 가격/브랜드/유형(서버 필터)도 같이 풀어야 한다 — 0개 결과의 원인이 대부분 이쪽이다.
    setAppliedFilters({ brand: undefined, price: undefined, storageType: undefined });
  };

  return (
    <div className="flex flex-1 flex-col">
      <div
        className="scrollbar-hide flex items-center gap-2 overflow-x-auto px-4 py-2"
        {...stopSwipePropagation}
      >
        <span className="text-label-m text-fg shrink-0 font-bold whitespace-nowrap">연관</span>
        {RELATED_KEYWORDS.map((keyword) => (
          <span
            key={keyword}
            className="text-label-m text-fg-secondary shrink-0 px-1 py-2 whitespace-nowrap"
          >
            {keyword}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-1 pt-2">
        <ListHeader
          count={filteredCount}
          sortOptions={SORT_OPTIONS}
          sortValue={sort}
          onSortChange={(value) => setSort(value as ProductListParams['sort'])}
          onFilterClick={() => setFilterSheetOpen(true)}
        />
        <div
          className="scrollbar-hide flex items-center gap-1 overflow-x-auto px-4"
          {...stopSwipePropagation}
        >
          <ToggleChip tone="brand" selected={kurlyOnly} onToggle={() => setKurlyOnly((v) => !v)}>
            Kurly Only
          </ToggleChip>
          {/* 멤버스혜택만 gradient 톤이라 `FilterChip` 을 쓰되, 확장 없는 토글이므로
              `showTrailingIcon={false}` 로 화살표를 끈다. */}
          <FilterChip
            tone="gradient"
            leadingIcon="member"
            showTrailingIcon={false}
            selected={membership}
            onClick={() => setMembership((v) => !v)}
          >
            멤버스혜택
          </FilterChip>
          <ToggleChip tone="neutral" selected={coupon} onToggle={() => setCoupon((v) => !v)}>
            쿠폰
          </ToggleChip>
          {/* Figma node 882-60580 "Vector 9" — 토글 칩 묶음과 카테고리 사이 구분선. */}
          <div className="bg-border mx-1 h-9 w-px shrink-0" />
          <FilterChip onClick={() => setFilterSheetOpen(true)}>카테고리</FilterChip>
        </div>
      </div>

      <ProductGrid
        items={items}
        isPending={isPending}
        isError={isError}
        onResetFilters={resetFilters}
      />

      <FilterSheet
        open={isFilterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        resultCount={filteredCount}
        keyword={query}
        sort={sort}
        quickFilters={filters}
        onApplyFilters={setAppliedFilters}
      />
    </div>
  );
}
