import type { Metadata } from 'next';

import { OrderHistoryContainer } from '@/components/organisms/mypage/OrderHistoryView/OrderHistoryContainer';

export const metadata: Metadata = { title: '주문 내역' };

/**
 * 주문 내역 (`/mypage/orders`). Figma "5팀 UI 공유용" node 771-106840·771-106998·848-86519.
 * `GET /api/v1/orders` 연동(이슈 #116) — 담기 토스트·취소 모달은 여전히 로컬 상태.
 * 렌더링(structure §2-1): 상호작용 중심 CSR — 정적 셸 + 클라 컨테이너.
 */
export default function OrderHistoryPage() {
  return <OrderHistoryContainer />;
}
