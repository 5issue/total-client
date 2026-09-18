'use client';

import { useQuery } from '@tanstack/react-query';

import { orderKeys } from '@/hooks/order/queryKeys';
import { getOrders } from '@/lib/apiClient';
import type { OrderListParams } from '@/types/order';

/** 내 주문 목록(주문 이력) 조회 — 기간 필터(`OrderHistoryView` 필터 탭) 기준. */
export function useOrders(params: OrderListParams) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => getOrders(params),
  });
}
