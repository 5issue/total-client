import type { Metadata } from 'next';

import { CartView } from '@/components/organisms/cart/CartView';

export const metadata: Metadata = { title: '장바구니' };

/**
 * 장바구니 — Figma "5팀 UI 공유용" node 188-8861 외 상태 노드.
 * 퍼블리싱 단계: 상태·상호작용(선택/삭제 모달/추천 바텀시트)까지. 데이터 훅·API 는 다음 단계.
 * 렌더링(structure §2-1): 상호작용 중심 CSR — 정적 셸(page) + 클라 컨테이너(CartView).
 */
export default function CartPage() {
  return <CartView />;
}
