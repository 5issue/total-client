import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { OrderDetailContainer } from '@/components/organisms/mypage/OrderDetailView/OrderDetailContainer';

export const metadata: Metadata = { title: '주문 내역 상세' };

/**
 * 주문 내역 상세 (`/mypage/orders/[orderId]`) — 주문 완료 화면의 "주문 상세보기" 진입점.
 * Figma node 666-28077. `GET /api/v1/orders/{orderId}` 연동(이슈 #116).
 */
export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const orderIdNum = Number(orderId);
  if (!Number.isInteger(orderIdNum) || orderIdNum <= 0) {
    notFound();
  }

  return <OrderDetailContainer orderId={orderIdNum} />;
}
