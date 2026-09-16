import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CancelReturnExchangeDetailView } from '@/components/organisms/mypage/CancelReturnExchangeDetailView';
import { MOCK_CANCEL_RETURN_EXCHANGE_ITEMS } from '@/components/organisms/mypage/CancelReturnExchangeHistoryView/mock';

export const metadata: Metadata = { title: '취소·반품 상세 내역' };

/**
 * 취소·반품 상세 내역 (`/mypage/orders/cancel-return-exchange/[id]`). Figma node
 * 848-83792(반품) / 666-30539(취소). 목록 화면 카드 클릭으로 들어온다.
 *
 * BE 연동 전이라 mock 배열에서 `id` 로 찾는다 — 교환은 mock 이 없어 항목을 못 찾으면
 * (교환이든 오타 id 든) 404 로 처리한다.
 */
export default async function CancelReturnExchangeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = MOCK_CANCEL_RETURN_EXCHANGE_ITEMS.find((candidate) => candidate.id === id);

  if (!item || item.type === '교환') notFound();

  return <CancelReturnExchangeDetailView item={item} />;
}
