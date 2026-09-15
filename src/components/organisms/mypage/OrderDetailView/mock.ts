import type { OrderBreakdownDetail } from '@/components/molecules/order/OrderBreakdownRow';

/**
 * 주문 내역 상세 스텁 데이터 (퍼블리싱 단계).
 * BE 주문 API 연동 전이라 화면 값은 전부 여기서 온다 — Figma node 666-28077 실측 그대로.
 */
export const MOCK_ORDER_DETAIL = {
  orderNumber: '24242424224422',
  paidAt: '2026.08.26 01:18',
  /** 요약 카드의 배송지(한 줄 요약). */
  address: '서울특별시 강남구 테헤란로 152, 101동 1502호 (역삼동, 강남파이낸스센터아파트)',
  status: '주문완료',
  // paidAt(2026.08.26)이 수요일이라 "내일"·08.27 은 목요일이다(Figma 원본 "(수)" 표기 오류 —
  // CodeRabbit 리뷰로 발견, 날짜 계산해서 확인함).
  arrival: '내일 (목) 아침 도착',
  /** 배송완료 상태에서 도착 예정 문구 대신 보여주는 실제 배송 완료 일시. */
  deliveredAt: '08.27(목) 04:16',
  receiver: '이준호',
  phone: '010-1234-****',
} as const;

export interface MockOrderProduct {
  id: string;
  deliveryType: string;
  name: string;
  price: number;
  originalPrice: number;
  quantity: number;
}

export const MOCK_ORDER_PRODUCTS: MockOrderProduct[] = [
  {
    id: 'p-1',
    deliveryType: '샛별배송',
    name: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
    price: 2780,
    originalPrice: 3400,
    quantity: 1,
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
  {
    id: 'p-4',
    deliveryType: '샛별배송',
    name: '[풀무원] 동물복지 치킨 너겟 오리지널',
    price: 7979,
    originalPrice: 8980,
    quantity: 1,
  },
];

/**
 * 일부만 반품완료 상태(node 848-82482) 전용 — 상품이 배송완료/반품완료 두 그룹으로
 * 나뉜다. Figma 데모는 4개 중 3개만 보여준다([풀무원] 치킨너겟은 두 그룹 어디에도
 * 없다) — 그 실측 그대로 반영했다.
 */
export const MOCK_PARTIAL_RETURN_GROUPS: {
  label: '배송완료' | '반품완료';
  rightText: string | null;
  hasReview: boolean;
  products: MockOrderProduct[];
}[] = [
  {
    label: '배송완료',
    rightText: MOCK_ORDER_DETAIL.deliveredAt,
    hasReview: true,
    products: MOCK_ORDER_PRODUCTS.slice(0, 2),
  },
  {
    label: '반품완료',
    rightText: null,
    hasReview: false,
    products: MOCK_ORDER_PRODUCTS.slice(2, 3),
  },
];

const COUPON_DETAILS: OrderBreakdownDetail[] = [
  { label: '상품 쿠폰', value: '0원' },
  { label: '장바구니 쿠폰', value: '0원' },
];

const POINT_DETAILS: OrderBreakdownDetail[] = [
  { label: '적립금', value: '0원' },
  { label: '컬리캐시', value: '0원' },
];

/** 결제 정보 카드. 첫 줄(상품 금액)은 강조라 따로 두고, 나머지는 표로 돈다. */
export const MOCK_PAYMENT_TOTAL = '35,240원';

export const MOCK_PAYMENT_ROWS = [
  { label: '상품 할인 금액', value: '-4,440원' },
  { label: '배송비', value: '0원' },
  { label: '카드즉시할인', value: '0원' },
  { label: '쿠폰할인 금액', value: '0원', details: COUPON_DETAILS },
  { label: '적립금 · 컬리캐시', value: '0원', details: POINT_DETAILS },
  { label: '결제금액', value: '30,800원' },
  { label: '결제방법', value: '토스페이', valueTone: 'quaternary' as const },
];

export const MOCK_ORDER_INFO_ROWS = [
  { label: '받는분', value: '이준호' },
  { label: '결제일시', value: '2026.08.26 01:18' },
  { label: '카드즉시할인', value: '0원' },
];

export const MOCK_DELIVERY_INFO_ROWS = [
  { label: '받으실 장소', value: '문 앞' },
  { label: '기타장소 세부사항', value: '문 앞' },
  { label: '포장 방법', value: '종이 포장재' },
];

export const MOCK_DELIVERY_REQUEST_ROWS = [
  { label: '메세지 전송 시점', value: '배송 직후' },
  { label: '미배송 시 조치방법', value: '결제수단으로 환불' },
];

export const MOCK_CANCEL_NOTICE = [
  '[주문완료] 또는 [배송준비중] 상태에서만 주문을 취소할 수 있어요.',
  '상품 수령 후 7일 동안 [마이컬리 > 주문내역]에서 교환반품을 신청할 수 있어요',
] as const;
