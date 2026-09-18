'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { orderKeys } from '@/hooks/order/queryKeys';
import { submitOrderReturn } from '@/lib/apiClient';
import type { OrderReturnRequest } from '@/types/order';

/**
 * 전체 주문 반품(환불) 신청. 성공하면 주문 목록·상세·취소반품 내역을 전부 무효화해
 * 반품 접수 상태가 다음 화면에서 바로 반영되게 한다(api-convention §7 — Optimistic Update 안 함).
 */
export function useSubmitReturn(orderId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: OrderReturnRequest) => submitOrderReturn(orderId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      void queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
