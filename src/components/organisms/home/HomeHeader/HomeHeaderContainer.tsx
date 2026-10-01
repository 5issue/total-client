'use client';

import { useCartItemCount } from '@/hooks/cart/useCartItemCount';

import { HomeHeader, type HomeHeaderProps } from './HomeHeader';

/**
 * `HomeHeader` 의 장바구니 배지를 실제 수량으로 채우는 컨테이너 — `page.tsx` 는 서버로 남기고
 * 이 경계만 클라이언트로 뗀다(§6-2 "개인화 구획만 CSR 훅으로 전환").
 */
export function HomeHeaderContainer(props: Omit<HomeHeaderProps, 'cartCount'>) {
  const cartCount = useCartItemCount();

  return <HomeHeader {...props} cartCount={cartCount} />;
}
