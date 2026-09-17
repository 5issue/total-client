import type { Metadata } from 'next';

import { OrderHistoryView } from '@/components/organisms/mypage/OrderHistoryView';

export const metadata: Metadata = { title: '주문 내역' };

/**
 * 주문 내역 (`/mypage/orders`). Figma "5팀 UI 공유용" node 771-106840·771-106998·848-86519.
 * 퍼블리싱 단계: 기간·검색·담기 토스트·취소 모달은 로컬 상태.
 * 렌더링(structure §2-1): 상호작용 중심 CSR — 정적 셸 + 클라 컨테이너.
 */
export default function OrderHistoryPage() {
  return <OrderHistoryView />;
}
