'use client';

import { useQuery } from '@tanstack/react-query';

import { cartKeys } from '@/hooks/cart/queryKeys';
import { getCart } from '@/lib/apiClient';

/** 장바구니 조회 — `CartView` 가 쓴다. */
export function useCart() {
  return useQuery({
    queryKey: cartKeys.detail(),
    queryFn: getCart,
  });
}
