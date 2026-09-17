import type { Metadata } from 'next';

import { OrderDetailView } from '@/components/organisms/mypage/OrderDetailView';

export const metadata: Metadata = { title: '주문 내역 상세' };

/**
 * 주문 내역 상세 (`/mypage/orders/[orderId]`) — 주문 완료 화면의 "주문 상세보기" 진입점.
 * Figma node 666-28077.
 *
 * 렌더링(structure §2-1): 값이 전부 스텁이라 지금은 정적 셸이다. BE 주문 API 연동 시
 * `orderId` 로 주문을 읽어와 `OrderDetailView` 에 내려주는 형태로 바뀐다(이슈 #94).
 */
export default function OrderDetailPage() {
  return <OrderDetailView />;
}
