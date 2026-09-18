'use client';

import { useMutation } from '@tanstack/react-query';

import { placeOrder } from '@/lib/apiClient';

/**
 * 주문 결제 요청 — [결제하기] 클릭 시 토스 결제창을 열기 직전 호출한다(#126).
 * 주문을 결제 대기 상태로 전이시키고, 그 응답의 `orderId`/`expiresAt` 를 토스에 그대로 넘긴다.
 */
export function usePlaceOrder() {
  return useMutation({
    mutationFn: placeOrder,
  });
}
