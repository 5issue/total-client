import { Suspense } from 'react';

import type { Metadata } from 'next';

import { CancelReturnExchangeHistoryContainer } from '@/components/organisms/mypage/CancelReturnExchangeHistoryView/CancelReturnExchangeHistoryContainer';

export const metadata: Metadata = { title: '취소·반품·교환 내역' };

/**
 * 취소·반품·교환 내역 (`/mypage/orders/cancel-return-exchange`). Figma node 666-30339.
 * `GET /api/v1/orders/cancellations-returns` 연동(이슈 #116).
 *
 * 선택 탭을 `useSearchParams()` 로 읽어 URL 에 커밋한다(카드→상세→뒤로가기 왕복 시
 * 탭 유지) — Next 가 이 훅에 Suspense 경계를 요구해 여기서 감싼다.
 */
export default function CancelReturnExchangeHistoryPage() {
  return (
    <Suspense>
      <CancelReturnExchangeHistoryContainer />
    </Suspense>
  );
}
