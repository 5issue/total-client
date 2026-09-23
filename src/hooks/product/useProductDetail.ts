'use client';

import { useQuery } from '@tanstack/react-query';

import { productKeys } from '@/hooks/product/queryKeys';
import { fetchProductDetail } from '@/lib/apiClient';

/** 상품 상세 조회 (api-convention §1·§4). `ProductDetailInteractiveShell` 이 소비한다. */
export function useProductDetail(productId: string) {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => fetchProductDetail(productId),
  });
}
