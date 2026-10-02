'use client';

import { useQuery } from '@tanstack/react-query';

import { productKeys } from '@/hooks/product/queryKeys';
import { fetchProductsByAi } from '@/lib/apiClient';

/**
 * AI product_id → BE 상품 매핑 조회(이슈 #203). `aiProductIds`가 비어있으면 비활성화.
 * `FridgeRefillBottomSheet`가 소비 — AI product_id를 BE 상품 PK로 오인해 엉뚱한 상품이
 * 조회되던 문제의 수정.
 */
export function useProductsByAi(aiProductIds: Array<string | number>, enabled = true) {
  return useQuery({
    queryKey: productKeys.byAi(aiProductIds),
    queryFn: () => fetchProductsByAi(aiProductIds),
    enabled: enabled && aiProductIds.length > 0,
  });
}
