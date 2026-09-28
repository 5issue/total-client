'use client';

import { useMutation } from '@tanstack/react-query';

import { checkoutOrder } from '@/lib/apiClient';

/**
 * 주문서 생성(체크아웃) — 장바구니에서 선택한 상품 id 로 실제 주문을 만든다(#126).
 * `CheckoutContainer` 가 `/checkout?items=` 진입 시 1회 호출해 `orderId`/실 상품·금액을 받는다.
 */
export function useCreateOrder() {
  return useMutation({
    mutationFn: checkoutOrder,
  });
}
