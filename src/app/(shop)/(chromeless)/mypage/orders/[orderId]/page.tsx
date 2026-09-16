import type { Metadata } from 'next';

import { SectionHeader } from '@/components/organisms/shared/SectionHeader';

export const metadata: Metadata = { title: '주문 내역 상세' };

/**
 * 주문 내역 상세 (`/mypage/orders/[orderId]`).
 * 목록의 방향 아이콘이 여기로 이동한다(Figma 주문 상세 내역_주문완료).
 * 상세 본문 퍼블리싱은 주문 상세 화면 이슈에서 이어 간다 — 이 라우트는 진입점만 연다.
 */
export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  await params;

  return (
    <div className="bg-surface-secondary flex flex-1 flex-col">
      <SectionHeader leading="back" leadingHref="/mypage/orders" title="주문 내역 상세" />
    </div>
  );
}
