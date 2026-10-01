'use client';

import { useQueries } from '@tanstack/react-query';

import { productKeys } from '@/hooks/product/queryKeys';
import { fetchProductDetail } from '@/lib/apiClient';

/**
 * 여러 상품의 썸네일만 필요한 화면(주문서 "주문상품" 등)에서 쓴다 — 주문서 생성 응답
 * (`CheckoutOrderItem`)엔 `productId`만 있고 이미지가 없어(order-service 계약 확인,
 * `mapCheckoutOrder.ts` 참고) 상품 상세를 각자 조회해 썸네일만 뽑아낸다.
 *
 * 쿼리 키(`productKeys.detail`)가 `useProductDetail`과 같아, 홈/검색 등에서 이미 조회한
 * 적 있는 상품이면 캐시를 그대로 재사용한다.
 */
export function useProductThumbnails(productIds: string[]) {
  const results = useQueries({
    queries: productIds.map((productId) => ({
      queryKey: productKeys.detail(productId),
      queryFn: () => fetchProductDetail(productId),
    })),
  });

  const thumbnails = new Map<string, string | undefined>();
  productIds.forEach((productId, i) => {
    thumbnails.set(
      productId,
      results[i]?.data?.media.find((m) => m.mediaRole === 'THUMBNAIL')?.mediaUrl,
    );
  });
  return thumbnails;
}
