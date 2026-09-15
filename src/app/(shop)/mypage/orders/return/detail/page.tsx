import type { Metadata } from 'next';

import { RefundDetailView } from '@/components/organisms/mypage/RefundDetailView';

export const metadata: Metadata = { title: '반품 내역 상세' };

/**
 * 반품 내역 상세 (`/mypage/orders/return/detail`). Figma "5팀 UI 공유용" node 795-64058·795-64232.
 * `/mypage/orders/return/reason` 에서 [다음] 클릭 후 도착하는 확인 화면.
 * 퍼블리싱 단계: 수거지·환불 금액은 목데이터, API 없음.
 */
export default function RefundReturnDetailPage() {
  return <RefundDetailView />;
}
