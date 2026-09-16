import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { RefundReasonView } from '@/components/organisms/mypage/RefundReasonView';
import { resolveSelectedRefundItems } from '@/components/organisms/mypage/RefundReasonView/resolveSelectedItems';

export const metadata: Metadata = { title: '반품사유' };

/**
 * 반품 사유 (`/mypage/orders/return/reason`).
 * Figma "5팀 UI 공유용" node 666-29306 · 666-29905 · 666-30033 · 848-82875(다건).
 * 퍼블리싱 단계: `/mypage/orders/return` 에서 체크한 상품 id(`?items=id1,id2`)를
 * `resolveSelectedRefundItems`(organism 쪽 입력 어댑터)로 목데이터와 매칭해 넘긴다 —
 * 라우트 파일에는 파싱·필터링 로직을 두지 않는다. 유효한 상품이 하나도 없으면
 * 상품 선택 화면으로 되돌린다. 사유 선택은 로컬 state. API 없음.
 */
export default async function RefundReturnReasonPage({
  searchParams,
}: {
  searchParams: Promise<{ items?: string }>;
}) {
  const { items: itemsParam } = await searchParams;
  const items = resolveSelectedRefundItems(itemsParam);

  if (items === null) {
    redirect('/mypage/orders/return');
  }

  return <RefundReasonView items={items} />;
}
