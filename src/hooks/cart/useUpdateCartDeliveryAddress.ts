'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { cartKeys } from '@/hooks/cart/queryKeys';
import { updateCartDeliveryAddress } from '@/lib/apiClient';

/** 장바구니 배송지 변경 — 기본 정책대로 성공 후 `invalidateQueries`(배송 가능 여부·배송비 재계산). */
export function useUpdateCartDeliveryAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: number) => updateCartDeliveryAddress(addressId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });
}
