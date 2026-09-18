'use client';

import { useQuery } from '@tanstack/react-query';

import { orderKeys } from '@/hooks/order/queryKeys';
import { getOrderDetail } from '@/lib/apiClient';

/** 주문 상세(주문 추적) 조회 — `OrderDetailView`가 쓴다. */
export function useOrderDetail(orderId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => getOrderDetail(orderId),
    enabled: (options?.enabled ?? true) && orderId > 0,
  });
}
