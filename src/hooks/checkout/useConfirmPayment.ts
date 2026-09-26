'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { checkoutKeys } from '@/hooks/checkout/queryKeys';
import { confirmPayment } from '@/lib/apiClient';

/** Toss successUrl 착지 후 결제 승인. 시크릿은 Spring, 이 훅은 BFF 만 호출한다. */
export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmPayment,
    onSuccess: (data) => {
      if (data.paymentId != null) {
        void queryClient.invalidateQueries({ queryKey: checkoutKeys.receipt(data.paymentId) });
      }
    },
  });
}
