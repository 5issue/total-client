import type { CartResponse } from '@/types/cart';

import type { OrderAmounts, OrderLineItemView } from '../model';

/** 장바구니에서 선택한 상품 id(`?items=` 로 넘어온 문자열 배열)만 골라 주문상품으로 변환. */
export function mapSelectedCartItemsToOrder(
  cart: CartResponse,
  selectedItemIds: string[],
): OrderLineItemView[] {
  const selected = new Set(selectedItemIds);
  return cart.groups
    .flatMap((group) => group.items)
    .filter((item) => selected.has(String(item.cartItemId)))
    .map((item) => ({
      id: String(item.cartItemId),
      name: item.name,
      imageSrc: item.thumbnailUrl ?? undefined,
      price: item.price,
      originalPrice: item.originalPrice ?? undefined,
      quantity: item.quantity,
    }));
}

/** 주문상품 목록 → 결제금액. `CartView` 의 amounts 계산과 같은 규칙(쿠폰·적립금 등은 아직 0). */
export function computeOrderAmounts(items: OrderLineItemView[]): OrderAmounts {
  let productPrice = 0;
  let productDiscount = 0;
  for (const item of items) {
    const listPrice = item.originalPrice ?? item.price;
    productPrice += listPrice * item.quantity;
    productDiscount += (listPrice - item.price) * item.quantity;
  }

  return {
    productPrice,
    productDiscount,
    shippingFee: 0,
    couponDiscount: 0,
    productCouponDiscount: 0,
    cartCouponDiscount: 0,
    cardInstantDiscount: 0,
    pointsCashUsed: 0,
    pointsUsed: 0,
    cashUsed: 0,
    total: productPrice - productDiscount,
  };
}
