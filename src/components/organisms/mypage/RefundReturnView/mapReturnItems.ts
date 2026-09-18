import type { OrderDetailResponse, OrderItem } from '@/types/order';

import type { RefundReturnItemView } from './model';

/**
 * `OrderDetailResponse.items` → 반품 화면 공통 상품 뷰 모델.
 * `RefundReturnView`/`RefundReasonView` 가 같은 `{id, name, imageSrc, price, quantity}`
 * 모양을 쓰기 때문에 두 컨테이너가 이 매퍼를 공유한다.
 */
export function mapOrderItemToRefundItem(item: OrderItem): RefundReturnItemView {
  return {
    id: String(item.orderItemId),
    name: item.title,
    imageSrc: item.thumbnailUrl ?? undefined,
    price: item.unitPrice,
    quantity: item.quantity,
  };
}

export function mapReturnItems(detail: OrderDetailResponse): RefundReturnItemView[] {
  return detail.items.map(mapOrderItemToRefundItem);
}
