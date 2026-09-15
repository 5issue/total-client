import type { Metadata } from 'next';

import { RefundReasonView } from '@/components/organisms/mypage/RefundReasonView';
import { MOCK_REFUND_ITEMS } from '@/components/organisms/mypage/RefundReturnView/mock';

export const metadata: Metadata = { title: '반품사유' };

/**
 * 반품 사유 (`/mypage/orders/return/reason`).
 * Figma "5팀 UI 공유용" node 666-29306 · 666-29905 · 666-30033 · 848-82875(다건).
 * 퍼블리싱 단계: `/mypage/orders/return` 에서 체크한 상품 id(`?items=id1,id2`)를 목데이터
 * (`MOCK_REFUND_ITEMS`)에서 찾아 넘긴다. 사유 선택은 로컬 state. API 없음.
 */
export default async function RefundReturnReasonPage({
  searchParams,
}: {
  searchParams: Promise<{ items?: string }>;
}) {
  const { items: itemsParam } = await searchParams;
  const selectedIds = itemsParam?.split(',').filter(Boolean) ?? [];
  const items = selectedIds.length
    ? MOCK_REFUND_ITEMS.filter((item) => selectedIds.includes(item.id))
    : undefined;

  return <RefundReasonView items={items} />;
}
