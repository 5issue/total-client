import type { CartResponse, CartTemperature as SpringCartTemperature } from '@/types/cart';

import type { CartDeliveryGroup, CartItemView } from '../model';

const TEMPERATURE_MAP: Record<SpringCartTemperature, CartItemView['temperature']> = {
  REFRIGERATED: 'refrigerated',
  FROZEN: 'frozen',
};

function subtotalOf(items: CartItemView[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function mapCartResponse(cart: CartResponse): CartDeliveryGroup[] {
  return cart.groups.map((group) => {
    const items: CartItemView[] = group.items.map((item) => ({
      id: String(item.cartItemId),
      name: item.name,
      imageSrc: item.thumbnailUrl ?? undefined,
      price: item.price,
      originalPrice: item.originalPrice ?? undefined,
      quantity: item.quantity,
      soldOut: item.soldOut,
      temperature: TEMPERATURE_MAP[item.temperature],
    }));

    return {
      id: group.groupId,
      deliveryLabel: group.deliveryLabel,
      checked: group.checked,
      items,
      // API 는 그룹 소계를 안 내려준다 — 선택 상품 판매가 합계로 클라에서 계산.
      subtotalPrice: subtotalOf(items),
      shippingFee: group.shippingFee,
    };
  });
}
