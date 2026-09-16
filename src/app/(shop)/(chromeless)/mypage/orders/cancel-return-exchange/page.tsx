import type { Metadata } from 'next';

import { CancelReturnExchangeHistoryView } from '@/components/organisms/mypage/CancelReturnExchangeHistoryView';

export const metadata: Metadata = { title: '취소·반품·교환 내역' };

/**
 * 취소·반품·교환 내역 (`/mypage/orders/cancel-return-exchange`). Figma node 666-30339.
 * 렌더링(structure §2-1): 값이 전부 스텁이라 지금은 정적 셸이다. BE 연동 시 로그인
 * 사용자의 취소·반품·교환 내역을 서버에서 읽어와 내려주는 형태로 바뀐다.
 */
export default function CancelReturnExchangeHistoryPage() {
  return <CancelReturnExchangeHistoryView />;
}
