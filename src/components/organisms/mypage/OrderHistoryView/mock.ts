import type { OrderHistoryOrder, OrderHistoryProduct } from './model';

/**
 * 주문 내역 퍼블리싱 스텁. Figma node 771-106840(주문완료)·771-106998(배송중)·
 * 848-86519(배송완료, 반품 접수 기간 종료)·771-107323(주문 2건)·771-107381(4건 펼쳐보기)·
 * 771-107724(일부 반품).
 */
export const MOCK_ORDER_PRODUCTS: OrderHistoryProduct[] = [
  {
    id: 'p-1',
    deliveryType: '샛별배송',
    name: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
    price: 2780,
    originalPrice: 3400,
    quantity: 1,
    imageSrc: '/orders/yonsei-milk-900ml.png',
  },
  {
    id: 'p-2',
    deliveryType: '샛별배송',
    name: "[Kurly's] 동물복지 유정란 20구",
    price: 10051,
    originalPrice: 10580,
    quantity: 1,
  },
  {
    id: 'p-3',
    deliveryType: '샛별배송',
    name: '바로먹는 아보카도 3입 (페루산)',
    price: 9990,
    originalPrice: 13000,
    quantity: 1,
  },
];

export const MOCK_EXTRA_PRODUCT: OrderHistoryProduct = {
  id: 'p-4',
  deliveryType: '샛별배송',
  name: '[풀무원] 동물복지 치킨 너겟 오리지널',
  price: 7979,
  originalPrice: 8980,
  quantity: 1,
};

export const MOCK_FOUR_ITEM_PRODUCTS: OrderHistoryProduct[] = [
  ...MOCK_ORDER_PRODUCTS,
  MOCK_EXTRA_PRODUCT,
];

export const MOCK_ORDER: OrderHistoryOrder = {
  id: 'order-1',
  orderNumber: '24242424224422',
  orderedAt: '2026.08.26',
  status: '주문완료',
  arrival: '내일 (수) 아침 도착',
  products: MOCK_ORDER_PRODUCTS,
};

/** 배송완료 카드 우측 시각 — Figma node 848-86519·771-107323. */
export const MOCK_DELIVERED_AT = '08.27(수) 04:16';

export const RETURN_DETAIL_HREF = '/mypage/orders/return/detail';

function cloneProducts(orderId: string): OrderHistoryProduct[] {
  return MOCK_ORDER_PRODUCTS.map((product) => ({
    ...product,
    id: `${orderId}-${product.id}`,
  }));
}

/** 주문 2건 — Figma node 771-107323. */
export const MOCK_ORDERS: OrderHistoryOrder[] = [
  MOCK_ORDER,
  {
    id: 'order-2',
    orderNumber: '24242424224423',
    orderedAt: '2026.08.26',
    status: '배송완료',
    arrival: MOCK_DELIVERED_AT,
    products: cloneProducts('order-2'),
    returnPeriodEnded: true,
  },
];

/** 상품 4건 — Figma node 771-107381. */
export const MOCK_FOUR_ITEM_ORDER: OrderHistoryOrder = {
  ...MOCK_ORDER,
  id: 'order-four',
  products: MOCK_FOUR_ITEM_PRODUCTS,
};

/** 일부만 반품 — Figma node 771-107724. */
export const MOCK_PARTIAL_RETURN_ORDER: OrderHistoryOrder = {
  id: 'order-partial',
  orderNumber: '24242424224422',
  orderedAt: '2026.08.26',
  status: '배송완료',
  arrival: MOCK_DELIVERED_AT,
  showIndicator: false,
  returnPeriodEnded: true,
  products: MOCK_ORDER_PRODUCTS.slice(0, 2),
  extraGroups: [
    {
      id: 'returned',
      status: '반품완료',
      products: [MOCK_ORDER_PRODUCTS[2]!],
    },
  ],
};

export const ORDER_STEPS = ['주문완료', '배송준비', '배송중', '배송완료'] as const;

export const PERIOD_OPTIONS = [
  { value: '3m', label: '3개월' },
  { value: '6m', label: '6개월' },
  { value: '1y', label: '1년' },
  { value: '3y', label: '3년' },
] as const;

export const TOAST_ADD_ONCE = '장바구니에 상품 1개를 다시 담았어요';
export const TOAST_ADD_AGAIN = '장바구니에 상품을 한 개 더 담았어요';
