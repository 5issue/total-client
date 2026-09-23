import type { ReturnReasonOption } from '@/types/order';

import type { RefundReasonOption } from './mock';

/**
 * `GET .../returns/preview` 의 `reasonOptions`(코드 RTN01~08) → 화면 선택지.
 * 실데이터는 온도정책(냉장/냉동)에 따라 이미 걸러져 오므로(단순변심 등) `disabled` 개념이 없다
 * — 목데이터의 "단순변심 비활성" 표기는 스토리북 전용 예시다.
 */
export function mapReasonOptions(options: ReturnReasonOption[]): RefundReasonOption[] {
  return options.map((option) => ({ id: option.code, label: option.displayName }));
}
