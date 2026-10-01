import { Suspense } from 'react';

import type { Metadata } from 'next';

import { LoadingIndicator } from '@/components/atoms/LoadingIndicator';
import { CartContainer } from '@/components/organisms/cart/CartView';

export const metadata: Metadata = { title: '장바구니' };

/**
 * 장바구니 — Figma "5팀 UI 공유용" node 188-8861 외 상태 노드.
 * `useCart` 로 실제 장바구니를 조회한다(이슈 #118). 추천 상품 담기/쿠폰은 범위 밖 — 그대로 mock.
 * 렌더링(structure §2-1): 상호작용 중심 CSR — 정적 셸(page) + 클라 컨테이너.
 *
 * `CartContainer`가 주문서 생성 실패 복귀(`orderError`)를 읽으려 `useSearchParams`를
 * 쓰므로(#193) Suspense 경계가 필요하다(`CheckoutPage`와 동일 이유).
 */
export default function CartPage() {
  return (
    <Suspense fallback={<LoadingIndicator label="장바구니를 불러오는 중" />}>
      <CartContainer />
    </Suspense>
  );
}
