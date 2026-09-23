'use client';

import { useQuery } from '@tanstack/react-query';

import { orderKeys } from '@/hooks/order/queryKeys';
import { getCancellationsReturns } from '@/lib/apiClient';
import type { CancellationReturnParams } from '@/types/order';

/** 취소·반품 통합 내역 조회 — `CancelReturnExchangeHistoryView`가 쓴다. */
export function useCancellationsReturns(params: CancellationReturnParams) {
  return useQuery({
    queryKey: orderKeys.cancellationsReturns(params),
    queryFn: () => getCancellationsReturns(params),
  });
}
