import { MOCK_REFUND_ITEMS } from '@/components/organisms/mypage/RefundReturnView/mock';

import type { RefundReasonItemInput } from './model';

/**
 * `/mypage/orders/return/reason` 라우트가 받는 `?items=id1,id2` 쿼리를 목데이터에서
 * 찾아 `RefundReasonView` 입력으로 변환하는 어댑터. 라우트 파일(`page.tsx`)은 organism
 * 조합과 훅 연결만 담당해야 하므로(structure-convention) 파싱·필터링 로직을 여기로 옮겼다.
 *
 * - 쿼리 자체가 없으면(직접 진입·스토리북 경유) `undefined` — `RefundReasonView` 가
 *   기본 목데이터로 폴백한다(기존 동작 유지).
 * - 쿼리는 있는데 유효한 상품이 하나도 없으면(잘못된 id, 오래된 링크 등) `null` —
 *   호출부(`page.tsx`)가 상품 선택 화면(`/mypage/orders/return`)으로 리다이렉트해야
 *   한다. 빈 배열을 그대로 넘기면 상품·입력 컨트롤이 없는 빈 화면에 `다음`만 비활성화된
 *   상태로 남는다(코드래빗 리뷰).
 */
export function resolveSelectedRefundItems(
  itemsParam: string | undefined,
): RefundReasonItemInput[] | undefined | null {
  const selectedIds = itemsParam?.split(',').filter(Boolean) ?? [];
  if (selectedIds.length === 0) return undefined;

  const items = MOCK_REFUND_ITEMS.filter((item) => selectedIds.includes(item.id));
  return items.length > 0 ? items : null;
}
