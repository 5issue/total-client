import type { Metadata } from 'next';

import { RefundReasonView } from '@/components/organisms/mypage/RefundReasonView';

export const metadata: Metadata = { title: '반품사유' };

/**
 * 반품 사유 (`/mypage/orders/return/reason`).
 * Figma "5팀 UI 공유용" node 666-29306 · 666-29905 · 666-30033.
 * 퍼블리싱 단계: 사유 선택만 로컬 state. API 없음.
 */
export default function RefundReturnReasonPage() {
  return <RefundReasonView />;
}
