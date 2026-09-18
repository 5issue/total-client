'use client';

import { useQuery } from '@tanstack/react-query';

import { orderKeys } from '@/hooks/order/queryKeys';
import { getReturnPreview } from '@/lib/apiClient';

/** 반품 접수 화면 진입 시 사유 옵션·예상 환불액·회수 정책을 먼저 받아온다. */
export function useReturnPreview(orderId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: orderKeys.returnPreview(orderId),
    queryFn: () => getReturnPreview(orderId),
    enabled: (options?.enabled ?? true) && orderId > 0,
  });
}
