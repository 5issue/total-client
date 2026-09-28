'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { cartKeys } from '@/hooks/cart/queryKeys';
import { addCartItems } from '@/lib/apiClient';
import type { AddCartItemsRequest } from '@/types/cart';

/** 장바구니 상품 담기(다건) — 기본 정책대로 성공 후 `invalidateQueries`. */
export function useAddCartItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AddCartItemsRequest) => addCartItems(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });
}
