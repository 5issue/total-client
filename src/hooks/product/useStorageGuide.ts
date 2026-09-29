'use client';

import { useQuery } from '@tanstack/react-query';

import { productKeys } from '@/hooks/product/queryKeys';
import { fetchStorageGuide } from '@/lib/apiClient';

/** 상품 보관 가이드 조회 (api-convention §1·§4). AI 파트 PROD-03. `enabled`로 온디맨드 호출. */
export function useStorageGuide(productId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: productKeys.storageGuide(productId),
    queryFn: () => fetchStorageGuide(productId),
    enabled: (options?.enabled ?? true) && productId.length > 0,
  });
}
