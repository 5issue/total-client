import type { Metadata } from 'next';

import { RefundReturnView } from '@/components/organisms/mypage/RefundReturnView';
import { RefundReturnContainer } from '@/components/organisms/mypage/RefundReturnView/RefundReturnContainer';

export const metadata: Metadata = { title: '반품 접수' };

/**
 * 반품 접수 (`/mypage/orders/return`). Figma "5팀 UI 공유용" node 848-82641·82701·82764.
 * `OrderHistoryView` "반품 접수" 버튼이 `?orderId=` 를 붙여 진입시킨다(이슈 #116).
 * `orderId` 가 없으면(직접 진입 등) 목데이터 화면으로 폴백.
 * 렌더링(structure §2-1): 상호작용 중심 CSR — 정적 셸 + 클라 컨테이너.
 */
export default async function RefundReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId: orderIdParam } = await searchParams;
  const orderId = Number(orderIdParam);

  if (!orderIdParam || !Number.isInteger(orderId) || orderId <= 0) {
    return <RefundReturnView />;
  }

  return <RefundReturnContainer orderId={orderId} />;
}
