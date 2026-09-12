import type { Metadata } from 'next';

import { AddressManageView } from '@/components/organisms/mypage/AddressManageView';

export const metadata: Metadata = { title: '배송지 관리' };

/**
 * 배송지 관리 (`/mypage/addresses`) — 장바구니 상단 "추가"/"변경" 진입점.
 * 퍼블리싱 단계: 배송지 없는 빈 상태만(Figma node 359-15270). 목록·CRUD·연결은 다음 단계.
 * 렌더링(structure §2-1): 상호작용(뒤로·추가) 중심 CSR — 정적 셸(page) + 클라 컨테이너(View).
 */
export default function AddressManagePage() {
  return <AddressManageView />;
}
