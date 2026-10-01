import type { CheckoutOrderResponse } from '@/types/order';

import type { OrderAmounts, OrderLineItemView } from '../model';

/**
 * 주문서 생성 응답(`POST /api/v1/orders/checkout`, #126) → 화면 표시 모델.
 * 응답에 원가/할인 항목이 없어(`CheckoutOrderItem` 에 `unitPrice`/`totalPrice` 뿐) 상품할인·쿠폰·
 * 카드즉시할인·적립금은 전부 0 — 최종 결제금액은 서버가 내려준 `paymentAmount` 를 그대로 쓴다
 * (항목 합계를 다시 더하지 않는다 — 서버가 권위 있는 값).
 *
 * 응답엔 이미지 필드가 없지만(`OrderItemResponseDto`, 2026-09-23 확인) `productId`는 있어
 * (CheckoutOrderItem) 호출부(`CheckoutContainer`)가 장바구니 응답(`useCart`, cart-service가
 * 직접 내려주는 `thumbnailUrl`)에서 뽑은 productId→썸네일 맵을 `thumbnails`로 받아 합친다
 * (#193 — 상품 상세 재조회는 로컬 시드 일부가 이미지 없이 비어 있어 장바구니 쪽으로 교체).
 */
export function mapCheckoutOrderToView(
  order: CheckoutOrderResponse,
  thumbnails: Map<string, string | undefined> = new Map(),
): {
  items: OrderLineItemView[];
  amounts: OrderAmounts;
} {
  const items: OrderLineItemView[] = order.items.map((item) => ({
    id: String(item.orderItemId),
    name: item.title,
    imageSrc: thumbnails.get(String(item.productId)),
    price: item.unitPrice,
    quantity: item.quantity,
  }));

  const productPrice = order.items.reduce((sum, item) => sum + item.totalPrice, 0);

  const amounts: OrderAmounts = {
    productPrice,
    productDiscount: 0,
    shippingFee: 0,
    couponDiscount: 0,
    productCouponDiscount: 0,
    cartCouponDiscount: 0,
    cardInstantDiscount: 0,
    pointsCashUsed: 0,
    pointsUsed: 0,
    cashUsed: 0,
    total: order.paymentAmount,
  };

  return { items, amounts };
}
