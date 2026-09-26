'use client';

import { useQuery } from '@tanstack/react-query';

import { checkoutKeys } from '@/hooks/checkout/queryKeys';
import { getPaymentReceipt } from '@/lib/apiClient';
import type { PaymentReceipt } from '@/types/checkout';

/**
 * 영수증 조회. SSR `initialData` 가 있으면 그걸로 그리고, 없거나 stale 이면
 * `privateFetch` 로 다시 가져온다.
 */
export function usePaymentReceipt(
  paymentId: number,
  options?: { initialData?: PaymentReceipt; enabled?: boolean },
) {
  return useQuery({
    queryKey: checkoutKeys.receipt(paymentId),
    queryFn: () => getPaymentReceipt(paymentId),
    enabled: (options?.enabled ?? true) && paymentId > 0,
    initialData: options?.initialData,
  });
}
