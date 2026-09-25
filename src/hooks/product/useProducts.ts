'use client';

import { useQuery } from '@tanstack/react-query';

import { productKeys } from '@/hooks/product/queryKeys';
import { getProductCategories, getProductFilters, searchProducts } from '@/lib/apiClient';
import type { Product, ProductListParams } from '@/types/product';

/**
 * 검색 결과 상품 목록 조회 (api-convention §1·§4). `SearchResultSection` 이 검색어
 * 제출(`submittedQuery`) 시 이 훅으로 상품 그리드 데이터를 가져온다.
 *
 * `query` 가 비어있으면 호출하지 않는다 — 결과 뷰 자체가 제출된 검색어가 있을 때만
 * 렌더되므로 방어적으로 `enabled` 를 둔다.
 */
export function useProducts({
  query,
  sort = 'recommend',
  brand,
  price,
  storageType,
  categoryId,
}: Partial<ProductListParams>) {
  const params: ProductListParams = {
    query: query ?? '',
    sort,
    brand,
    price,
    storageType,
    categoryId,
  };

  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => searchProducts(params),
    enabled: params.query.trim().length > 0,
  });
}

/**
 * 필터 바텀시트(브랜드/가격/유형 탭)용 옵션 조회(#128). `keyword` 가 비어있거나 시트가
 * 열리기 전엔 호출하지 않는다(`enabled`) — 열 때마다 새로 불러올 필요는 없으니 캐시는
 * `productKeys.filters(keyword)` 로 검색어 단위로 공유된다.
 */
export function useProductFilters(keyword: string, enabled = true) {
  return useQuery({
    queryKey: productKeys.filters(keyword),
    queryFn: () => getProductFilters(keyword),
    enabled: enabled && keyword.trim().length > 0,
  });
}

/**
 * 필터 바텀시트 "카테고리" 탭용 최상위 카테고리 목록(#128). 검색어와 무관한 전체 트리라
 * `keyword` 인자가 없다 — 시트가 열려 있을 때만 불러온다(`enabled`).
 */
export function useProductCategories(enabled = true) {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: () => getProductCategories(),
    enabled,
  });
}

/**
 * 검색 결과 화면의 퀵필터 칩(Kurly Only/멤버스혜택/쿠폰, `SearchResultSection`) 상태.
 * 실제 필터 API 가 없어(#90 이슈 범위 — 필터 시트 연동은 별도 협의) 이미 받아온
 * 목록을 클라이언트에서 AND 조건으로 좁히는 임시 구현이다. 백엔드 필터 API 가
 * 생기면 이 함수는 지우고 `useProducts` 의 쿼리 파라미터로 옮긴다.
 */
export type ProductQuickFilters = {
  kurlyOnly: boolean;
  coupon: boolean;
  membershipBenefit: boolean;
};

export function filterProducts(items: Product[], filters: ProductQuickFilters): Product[] {
  return items.filter((item) => {
    if (filters.kurlyOnly && !item.kurlyOnly) return false;
    if (filters.coupon && !item.couponBadgeLabel) return false;
    if (filters.membershipBenefit && !item.membershipBenefit) return false;
    return true;
  });
}
