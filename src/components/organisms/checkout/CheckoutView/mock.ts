import type { OrderAmounts, OrderLineItemView } from '@/components/organisms/checkout/model';

/** 퍼블리싱용 더미 데이터 — 데이터 연동 시 훅(`useCheckout`)이 대체한다. */

/** 바로구매 흐름 — 장바구니 `MOCK_CART_GROUPS` 의 첫 상품과 동일(퍼블리싱 목데이터 재사용). */
export const MOCK_ORDER_ITEM: OrderLineItemView = {
  id: 'item-1',
  name: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
  price: 2780,
  originalPrice: 3400,
  quantity: 1,
};

export const MOCK_CUSTOMER = {
  name: '이준호',
  phone: '010-1234-1234',
};

export const MOCK_DEFAULT_ADDRESS = {
  isDefault: true,
  addressLine: '서울특별시 강남구 테헤란로 152, 101동 1502호 (역삼동, 강남파이낸스센터아파트)',
};

export const MOCK_AMOUNTS: OrderAmounts = {
  productPrice: 2780,
  productDiscount: 620,
  shippingFee: 3000,
  couponDiscount: 0,
  productCouponDiscount: 0,
  cartCouponDiscount: 0,
  cardInstantDiscount: 0,
  pointsCashUsed: 0,
  pointsUsed: 0,
  cashUsed: 0,
  total: 5780,
};
