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
  REFRIGERATED: '샛별 배송',
  FROZEN: '냉동배송',
};

function subtotalOf(items: CartItemView[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function mapCartResponse(cart: CartResponse): CartDeliveryGroup[] {
  return cart.groups.map((group) => {
    const items: CartItemView[] = group.items.map((item) => ({
      // 체크아웃 주문서 생성(POST /orders/checkout)이 cartItemId 배열을 받는다(이슈 #126)
      // — 화면 선택·"주문하기" 핸드오프는 이 id를 그대로 쓴다. productId는 수량변경·삭제
      // API 전용으로 따로 들고 간다(CartItemView.productId, model.ts 참고).
      id: String(item.cartItemId),
      productId: item.productId,
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
