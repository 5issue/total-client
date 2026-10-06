import type { RefundReturnItemView } from './model';

/** 퍼블리싱용 더미 — 데이터 연동 시 주문 상세 훅이 대체한다. Figma node 848-82641 상품 4건. */
export const MOCK_REFUND_ITEMS: RefundReturnItemView[] = [
  {
    id: 'item-1',
    name: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
    price: 2780,
    quantity: 1,
  },
  {
    id: 'item-2',
    name: "[Kurly's] 동물복지 유정란 20구",
    price: 10051,
    quantity: 1,
  },
  {
    id: 'item-3',
    name: '바로먹는 아보카도 3입 (페루산)',
    price: 9990,
    quantity: 1,
  },
  {
    id: 'item-4',
    name: '[풀무원] 동물복지 치킨 너겟 오리지널',
    price: 7979,
    quantity: 1,
  },
];
