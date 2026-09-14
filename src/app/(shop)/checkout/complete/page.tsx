import type { Metadata } from 'next';

import { OrderCompleteView } from '@/components/organisms/checkout/OrderCompleteView';

export const metadata: Metadata = { title: '주문 완료' };

/**
 * 주문 완료 (`/checkout/complete`) — 결제 후 도착하는 종착 화면. Figma node 666-26284.
 * 렌더링(structure §2-1): 값이 전부 스텁이고 상호작용이 추천 캐러셀뿐이라 정적 셸 그대로 —
 * 결제/주문 API 연동 시 `orderId` 쿼리로 서버에서 주문을 읽어오는 형태로 바뀐다(이슈 #93).
 */
export default function CheckoutCompletePage() {
  return <OrderCompleteView />;
}
