'use client';

import { useQuery } from '@tanstack/react-query';

import { productKeys } from '@/hooks/product/queryKeys';
import { fetchProductDetail } from '@/lib/apiClient';

/**
 * 상품 상세 조회 (api-convention §1·§4). `ProductDetailInteractiveShell` 이 소비한다.
 * `enabled`(기본 true) — `productId`를 아직 모르는 시점(예: 시트가 닫혀 있어 대상
 * 상품이 없을 때)엔 호출부가 `false`로 넘겨 불필요한 조회를 막는다(이슈 #145).
 */
export function useProductDetail(productId: string, enabled = true) {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => fetchProductDetail(productId),
    enabled,
  });
}
