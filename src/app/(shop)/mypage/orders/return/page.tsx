import type { Metadata } from 'next';

import { RefundReturnView } from '@/components/organisms/mypage/RefundReturnView';

export const metadata: Metadata = { title: '반품 접수' };

/**
 * 반품 접수 (`/mypage/orders/return`). Figma "5팀 UI 공유용" node 848-82641·82701·82764.
 * 퍼블리싱 단계: 상품 선택 로컬 state. 다음은 반품 사유 화면.
 * 렌더링(structure §2-1): 상호작용 중심 CSR — 정적 셸 + 클라 컨테이너.
 */
export default function RefundReturnPage() {
  return <RefundReturnView />;
}
