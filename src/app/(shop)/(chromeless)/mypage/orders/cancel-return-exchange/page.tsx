import { Suspense } from 'react';

import type { Metadata } from 'next';

import { CancelReturnExchangeHistoryView } from '@/components/organisms/mypage/CancelReturnExchangeHistoryView';

export const metadata: Metadata = { title: '취소·반품·교환 내역' };

/**
 * 취소·반품·교환 내역 (`/mypage/orders/cancel-return-exchange`). Figma node 666-30339.
 * 렌더링(structure §2-1): 값이 전부 스텁이라 지금은 정적 셸이다. BE 연동 시 로그인
 * 사용자의 취소·반품·교환 내역을 서버에서 읽어와 내려주는 형태로 바뀐다.
 *
 * 선택 탭을 `useSearchParams()` 로 읽어 URL 에 커밋한다(카드→상세→뒤로가기 왕복 시
 * 탭 유지) — Next 가 이 훅에 Suspense 경계를 요구해 여기서 감싼다. 값이 전부 클라
 * 스텁이라 폴백이 눈에 보일 일은 없다.
 */
export default function CancelReturnExchangeHistoryPage() {
  return (
    <Suspense>
      <CancelReturnExchangeHistoryView />
    </Suspense>
  );
}
