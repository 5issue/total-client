import type {
  CartDeliveryType,
  CartResponse,
  CartTemperature as SpringCartTemperature,
} from '@/types/cart';

import type { CartDeliveryGroup, CartItemView } from '../model';

const TEMPERATURE_MAP: Record<SpringCartTemperature, CartItemView['temperature']> = {
  ROOM_TEMPERATURE: 'refrigerated',
  REFRIGERATED: 'refrigerated',
  FROZEN: 'frozen',
};

/** `deliveryType` 이 있으면 그 라벨, 없으면(판매자 직배송 등) 보관 온도로 대신한다. */
const DELIVERY_LABEL: Record<CartDeliveryType, string> = {
  DAWN: '샛별배송',
  PARCEL: '택배배송',
  SELLER: '판매자배송',
};
const TEMPERATURE_LABEL: Record<SpringCartTemperature, string> = {
  ROOM_TEMPERATURE: '실온배송',
  REFRIGERATED: '냉장배송',
  FROZEN: '냉동배송',
};

function subtotalOf(items: CartItemView[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function mapCartResponse(cart: CartResponse): CartDeliveryGroup[] {
  return cart.groups.map((group) => {
    const items: CartItemView[] = group.items.map((item) => ({
      // 수량변경·삭제 API 가 productId 로 항목을 찾는다(CartService 확인, 2026-09-24) —
      // 화면 아이템 id도 cartItemId가 아니라 productId로 맞춘다. 한 장바구니엔 상품당
      // 항목이 하나뿐이라(findItemByProductId) productId만으로도 유일성이 보장된다.
      id: String(item.productId),
      name: item.title,
      imageSrc: item.thumbnailUrl ?? undefined,
      price: item.unitPrice,
      // API 는 정가를 따로 안 내려준다(unitPrice 하나) — 할인 표시가 필요 없는 계산이라 생략.
      soldOut: !item.available,
      quantity: item.quantity,
      temperature: TEMPERATURE_MAP[group.temperatureType],
    }));

    return {
      // API 가 그룹 id 를 안 내려줘서, 백엔드가 그룹을 묶는 기준(배송유형+보관온도+판매자)
      // 그대로 합성 키를 만든다 — 같은 조합이면 재조회 후에도 같은 id 를 유지한다.
      id: [
        group.deliveryType ?? 'NONE',
        group.temperatureType,
        group.seller?.sellerId ?? 'NONE',
      ].join('-'),
      deliveryLabel: group.deliveryType
        ? DELIVERY_LABEL[group.deliveryType]
        : TEMPERATURE_LABEL[group.temperatureType],
      // API 는 배송유형 체크 상태를 안 내려준다 — 화면 로컬 토글이라 조회 시엔 항상 켜진 채 시작.
      checked: true,
      items,
      subtotalPrice: subtotalOf(items),
      shippingFee: group.groupDeliveryFee,
    };
  });
}
