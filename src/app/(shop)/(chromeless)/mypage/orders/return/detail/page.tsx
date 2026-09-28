import type { Metadata } from 'next';

import { RefundDetailView } from '@/components/organisms/mypage/RefundDetailView';
import { RefundDetailContainer } from '@/components/organisms/mypage/RefundDetailView/RefundDetailContainer';

export const metadata: Metadata = { title: '반품 내역 상세' };

/**
 * 반품 내역 상세 (`/mypage/orders/return/detail`). Figma "5팀 UI 공유용" node 795-64058·795-64232.
 * `/mypage/orders/return/reason` 에서 [다음] 클릭 후 도착하는 확인 화면 —
 * `?orderId=&reasonCode=&reasonDetail=` 을 받아 `RefundDetailContainer` 가
 * `useReturnPreview`/`useSubmitReturn` 으로 실제 환불 예상액 조회·접수를 처리한다.
 * `orderId` 가 없으면(직접 진입·스토리북) 목데이터 화면으로 폴백.
 * 렌더링: 이 라우트는 RSC, 로컬 UI 상태(약관 모달 등)는 client organism 이 담당한다.
 */
export default async function RefundReturnDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; reasonCode?: string; reasonDetail?: string }>;
}) {
  const { orderId: orderIdParam, reasonCode, reasonDetail } = await searchParams;
  const orderId = Number(orderIdParam);

  if (!orderIdParam || !Number.isInteger(orderId) || orderId <= 0 || !reasonCode) {
    return <RefundDetailView />;
  }

  return (
    <RefundDetailContainer
      orderId={orderId}
      reasonCode={reasonCode}
      reasonDetail={reasonDetail ?? ''}
    />
  );
}
