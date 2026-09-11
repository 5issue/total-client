import type { OrderAmounts, OrderLineItemView } from '@/components/organisms/checkout/model';

/** 퍼블리싱용 더미 데이터 — 데이터 연동 시 훅(`useCheckout`)이 대체한다. */

/**
 * 바로구매 흐름 — 장바구니 `MOCK_CART_GROUPS` 의 상품 4건과 동일(퍼블리싱 목데이터 재사용).
 * 2건 이상이라 "주문상품" 이 아코디언으로 바뀌는 상태(Figma node 666-23446/25396)를
 * 기본으로 보여준다 — 1건짜리 정적 상태(node 666-23208)를 다시 보려면 이 배열을 1개로
 * 줄이면 된다(OrderLineItemSection 이 개수에 따라 알아서 갈라진다).
 */
export const MOCK_ORDER_ITEMS: OrderLineItemView[] = [
  {
    id: 'item-1',
    name: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
    price: 2780,
    originalPrice: 3400,
    quantity: 1,
  },
  {
    id: 'item-2',
    name: "[Kurly's] 동물복지 유정란 20구",
    price: 10051,
    originalPrice: 10580,
    quantity: 1,
  },
  {
    id: 'item-3',
    name: '바로먹는 아보카도 3입 (페루산)',
    price: 9990,
    originalPrice: 13900,
    quantity: 1,
  },
  {
    id: 'item-4',
    name: '[풀무원] 동물복지 치킨 너겟 오리지널',
    price: 7979,
    originalPrice: 7360,
    quantity: 1,
  },
];

export const MOCK_CUSTOMER = {
  name: '이준호',
  phone: '010-1234-1234',
  email: 'kurlykurly1234@naver.com',
};

export const MOCK_DEFAULT_ADDRESS = {
  isDefault: true,
  addressLine: '서울특별시 강남구 테헤란로 152, 101동 1502호 (역삼동, 강남파이낸스센터아파트)',
  /** 배송 상세정보 입력 후 표시에 쓰는 받는 분 — 주문자와 다를 수 있어 별도로 둔다(Figma
   * node 666-24922 는 우연히 같은 값이지만, 실제로는 배송지마다 다른 받는 분이 있을 수 있다). */
  recipient: '이준호',
  phone: '010-1234-1234',
};

export const MOCK_AMOUNTS: OrderAmounts = {
  productPrice: 35240,
  productDiscount: 4440,
  shippingFee: 0,
  couponDiscount: 0,
  productCouponDiscount: 0,
  cartCouponDiscount: 0,
  cardInstantDiscount: 0,
  pointsCashUsed: 0,
  pointsUsed: 0,
  cashUsed: 0,
  total: 30800,
};
