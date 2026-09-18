'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { cartKeys } from '@/hooks/cart/queryKeys';
import { removeCartItems } from '@/lib/apiClient';

/** 장바구니 상품 삭제(단일·다건 공통) — 기본 정책대로 성공 후 `invalidateQueries`. */
export function useRemoveCartItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartItemIds: number[]) => removeCartItems({ cartItemIds }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });
}
