'use client';

import { useSession } from '@/hooks/auth/useSession';
import { useCart } from '@/hooks/cart/useCart';

import { KurlyHeader, type KurlyHeaderProps } from './KurlyHeader';

/**
 * `KurlyHeader` 의 장바구니 배지를 실제 수량으로 채우는 컨테이너 —
 * `HomeHeaderContainer`와 같은 패턴(§6-2 "개인화 구획만 CSR 훅으로 전환"). 비로그인
 * (게스트, 예: `/login`)은 `useSession`으로만 판별하고 `useCart` 자체를 안 불러
 * 불필요한 401을 만들지 않는다.
 */
export function KurlyHeaderContainer(props: Omit<KurlyHeaderProps, 'cartCount'>) {
  const sessionQuery = useSession();
  const authenticated = sessionQuery.data?.authenticated ?? false;
  const cartQuery = useCart({ enabled: authenticated });

  const cartCount = authenticated
    ? (cartQuery.data?.groups.flatMap((g) => g.items).reduce((sum, i) => sum + i.quantity, 0) ?? 0)
    : 0;

  return <KurlyHeader {...props} cartCount={cartCount} />;
}
