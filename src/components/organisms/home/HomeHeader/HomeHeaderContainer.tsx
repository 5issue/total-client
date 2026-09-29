'use client';

import { useSession } from '@/hooks/auth/useSession';
import { useCart } from '@/hooks/cart/useCart';

import { HomeHeader, type HomeHeaderProps } from './HomeHeader';

/**
 * `HomeHeader` 의 장바구니 배지를 실제 수량으로 채우는 컨테이너 — `page.tsx` 는 서버로 남기고
 * 이 경계만 클라이언트로 뗀다(§6-2 "개인화 구획만 CSR 훅으로 전환"). 비로그인(게스트) 은
 * `useSession` 으로만 판별하고 `useCart` 자체를 안 불러 불필요한 401 을 만들지 않는다.
 */
export function HomeHeaderContainer(props: Omit<HomeHeaderProps, 'cartCount'>) {
  const sessionQuery = useSession();
  const authenticated = sessionQuery.data?.authenticated ?? false;
  const cartQuery = useCart({ enabled: authenticated });

  const cartCount = authenticated
    ? (cartQuery.data?.groups.flatMap((g) => g.items).reduce((sum, i) => sum + i.quantity, 0) ?? 0)
    : 0;

  return <HomeHeader {...props} cartCount={cartCount} />;
}
