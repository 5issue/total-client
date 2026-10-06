'use client';

import { useQuery } from '@tanstack/react-query';

import { cartKeys } from '@/hooks/cart/queryKeys';
import { getCart } from '@/lib/apiClient';

/**
 * 장바구니 조회 — `CartView` 가 쓴다.
 * `enabled` — 로그인 여부를 모르는(또는 게스트인) 화면에서 불필요한 401 을 막을 때만 넘긴다
 * (예: `HomeHeaderContainer` — 로그인 전엔 아예 호출하지 않는다). 기본은 항상 호출.
 */
export function useCart(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: cartKeys.detail(),
    queryFn: getCart,
    enabled: options?.enabled ?? true,
  });
}
