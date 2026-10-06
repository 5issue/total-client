import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { RefundReasonView } from '@/components/organisms/mypage/RefundReasonView';
import { RefundReasonContainer } from '@/components/organisms/mypage/RefundReasonView/RefundReasonContainer';

export const metadata: Metadata = { title: '반품사유' };

/**
 * 반품 사유 (`/mypage/orders/return/reason`).
 * Figma "5팀 UI 공유용" node 666-29306 · 666-29905 · 666-30033 · 848-82875(다건).
 * `/mypage/orders/return` 에서 체크한 상품 id(`?items=id1,id2`) + 주문 id(`?orderId=`)를
 * `RefundReasonContainer` 가 `useOrderDetail`/`useReturnPreview` 로 실데이터와 매칭한다.
 * `orderId` 가 없으면(직접 진입·스토리북) 목데이터 화면으로 폴백. `orderId` 는 있는데
 * `items` 가 없으면(단계 건너뛰기) 상품 선택 화면으로 되돌린다.
 */
export default async function RefundReturnReasonPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; items?: string }>;
}) {
  const { orderId: orderIdParam, items: itemsParam } = await searchParams;

  if (!orderIdParam) {
    return <RefundReasonView />;
  }

  const orderId = Number(orderIdParam);
  const itemIds = itemsParam?.split(',').filter(Boolean) ?? [];

  if (!Number.isInteger(orderId) || orderId <= 0 || itemIds.length === 0) {
    redirect(`/mypage/orders/return?orderId=${orderIdParam}`);
  }

  return <RefundReasonContainer orderId={orderId} itemIds={itemIds} />;
}
