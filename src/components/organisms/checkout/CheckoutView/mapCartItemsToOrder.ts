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

/**
 * 선택한 상품이 속한 배송 그룹들의 배송비 합.
 * 배송비는 그룹 단위 값이라(`CartDeliveryGroupSchema.shippingFee`), 그룹 안 상품이 하나라도
 * 선택됐으면 그 그룹 배송비를 1회만 더한다(같은 그룹 상품을 여러 개 선택해도 중복 합산 안 함).
 */
function shippingFeeOf(cart: CartResponse, selectedItemIds: string[]): number {
  const selected = new Set(selectedItemIds);
  return cart.groups
    .filter((group) => group.items.some((item) => selected.has(String(item.cartItemId))))
    .reduce((sum, group) => sum + group.shippingFee, 0);
}

/** 주문상품 목록 → 결제금액. `CartView` 의 amounts 계산과 같은 규칙(쿠폰·적립금 등은 아직 0). */
export function computeOrderAmounts(cart: CartResponse, selectedItemIds: string[]): OrderAmounts {
  const items = mapSelectedCartItemsToOrder(cart, selectedItemIds);

  let productPrice = 0;
  let productDiscount = 0;
  for (const item of items) {
    const listPrice = item.originalPrice ?? item.price;
    productPrice += listPrice * item.quantity;
    productDiscount += (listPrice - item.price) * item.quantity;
  }
  const shippingFee = shippingFeeOf(cart, selectedItemIds);

  return {
    productPrice,
    productDiscount,
    shippingFee,
    couponDiscount: 0,
    productCouponDiscount: 0,
    cartCouponDiscount: 0,
    cardInstantDiscount: 0,
    pointsCashUsed: 0,
    pointsUsed: 0,
    cashUsed: 0,
    total: productPrice - productDiscount + shippingFee,
  };
}
