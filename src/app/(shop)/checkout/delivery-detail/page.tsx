import type { Metadata } from 'next';

import { DeliveryDetailEditView } from '@/components/organisms/checkout/DeliveryDetailEditView';

export const metadata: Metadata = { title: '배송 상세 정보' };

/**
 * 배송 상세정보 수정 (`/checkout/delivery-detail`) — 체크아웃 '배송 상세정보'의 "수정"
 * 버튼으로 이동하는 화면. 체크아웃(#82/#84)이 아직 develop 에 없어, 이번 작업은 이
 * 라우트+화면만 우선 만든다 — 실제 "수정" 버튼 → 이 라우트 연결은 #84 머지 후(issue #92).
 * 렌더링(structure §2-1): 라디오·입력 상호작용 중심 CSR — 정적 셸(page) + 클라 컨테이너(View).
 */
export default function DeliveryDetailEditPage() {
  return <DeliveryDetailEditView />;
}
