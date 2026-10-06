'use client';

import { useCartItemCount } from '@/hooks/cart/useCartItemCount';

import { KurlyHeader, type KurlyHeaderProps } from './KurlyHeader';

/**
 * `KurlyHeader` 의 장바구니 배지를 실제 수량으로 채우는 컨테이너 —
 * `HomeHeaderContainer`와 같은 패턴(§6-2 "개인화 구획만 CSR 훅으로 전환").
 */
export function KurlyHeaderContainer(props: Omit<KurlyHeaderProps, 'cartCount'>) {
  const cartCount = useCartItemCount();

  return <KurlyHeader {...props} cartCount={cartCount} />;
}
