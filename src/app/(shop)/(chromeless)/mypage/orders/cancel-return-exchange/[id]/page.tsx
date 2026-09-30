import type { Metadata } from 'next';

import { CancelReturnExchangeDetailContainer } from '@/components/organisms/mypage/CancelReturnExchangeDetailView/CancelReturnExchangeDetailContainer';

export const metadata: Metadata = { title: '취소·반품 상세 내역' };

/**
 * 취소·반품 상세 내역 (`/mypage/orders/cancel-return-exchange/[id]`). Figma node
 * 848-83792(반품) / 666-30539(취소). 목록 화면 카드 클릭으로 들어온다(이슈 #148).
 */
export default async function CancelReturnExchangeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <CancelReturnExchangeDetailContainer id={id} />;
}
