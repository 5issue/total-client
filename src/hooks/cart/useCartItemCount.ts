'use client';

import { useSession } from '@/hooks/auth/useSession';

import { useCart } from './useCart';

/**
 * 헤더 장바구니 배지 등에서 쓰는 총 담긴 수량(`groups[].items[].quantity` 합).
 * `HomeHeaderContainer`/`KurlyHeaderContainer`가 각자 갖고 있던 동일 로직을 모았다 —
 * 비로그인(게스트)은 `useSession`으로만 판별하고 `useCart` 자체를 안 불러 불필요한
 * 401을 만들지 않는다.
 */
export function useCartItemCount() {
  const sessionQuery = useSession();
  const authenticated = sessionQuery.data?.authenticated ?? false;
  const cartQuery = useCart({ enabled: authenticated });

  if (!authenticated) return 0;
  return (
    cartQuery.data?.groups.flatMap((g) => g.items).reduce((sum, i) => sum + i.quantity, 0) ?? 0
  );
}
