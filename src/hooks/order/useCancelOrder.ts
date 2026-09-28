'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { orderKeys } from '@/hooks/order/queryKeys';
import { cancelOrder } from '@/lib/apiClient';
import type { OrderCancelRequest } from '@/types/order';

/** 주문 취소(배송 전) 신청 — 주문 상세 화면의 "주문 취소" 모달이 쓴다. */
export function useCancelOrder(orderId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: OrderCancelRequest) => cancelOrder(orderId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      void queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
