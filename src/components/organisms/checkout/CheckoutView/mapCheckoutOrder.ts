import type { CheckoutOrderResponse } from '@/types/order';

import type { OrderAmounts, OrderLineItemView } from '../model';

/**
 * 주문서 생성 응답(`POST /api/v1/orders/checkout`, #126) → 화면 표시 모델.
 * 응답에 원가/할인 항목이 없어(`CheckoutOrderItem` 에 `unitPrice`/`totalPrice` 뿐) 상품할인·쿠폰·
 * 카드즉시할인·적립금은 전부 0 — 최종 결제금액은 서버가 내려준 `paymentAmount` 를 그대로 쓴다
 * (항목 합계를 다시 더하지 않는다 — 서버가 권위 있는 값).
 */
export function mapCheckoutOrderToView(order: CheckoutOrderResponse): {
  items: OrderLineItemView[];
  amounts: OrderAmounts;
} {
  const items: OrderLineItemView[] = order.items.map((item) => ({
    id: String(item.orderItemId),
    name: item.title,
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
