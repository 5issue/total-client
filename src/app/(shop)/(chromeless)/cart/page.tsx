import type { Metadata } from 'next';

import { CartContainer } from '@/components/organisms/cart/CartView';

export const metadata: Metadata = { title: '장바구니' };

/**
 * 장바구니 — Figma "5팀 UI 공유용" node 188-8861 외 상태 노드.
 * `useCart` 로 실제 장바구니를 조회한다(이슈 #118). 추천 상품 담기/쿠폰은 범위 밖 — 그대로 mock.
 * 렌더링(structure §2-1): 상호작용 중심 CSR — 정적 셸(page) + 클라 컨테이너.
 */
export default function CartPage() {
  return <CartContainer />;
}
