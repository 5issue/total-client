import type { CartDeliveryGroup, RecommendProductView } from '@/components/organisms/cart/model';

/** 퍼블리싱용 더미 데이터 — 데이터 연동 시 훅(`useCart`)이 대체한다. */

export const MOCK_CART_GROUPS: CartDeliveryGroup[] = [
  {
    id: 'saetbyeol',
    deliveryLabel: '샛별배송',
    subtotalPrice: 30800,
    shippingFee: 0,
    items: [
      {
        id: 'item-1',
        name: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
        price: 2780,
        originalPrice: 3400,
        quantity: 1,
        temperature: 'refrigerated',
      },
      {
        id: 'item-2',
        name: "[Kurly's] 동물복지 유정란 20구",
        price: 10051,
        originalPrice: 10580,
        quantity: 1,
        temperature: 'refrigerated',
      },
      {
        id: 'item-3',
        name: '바로먹는 아보카도 3입 (페루산)',
        price: 9990,
        originalPrice: 13900,
        quantity: 1,
        temperature: 'refrigerated',
      },
      {
        id: 'item-4',
        name: '[풀무원] 동물복지 치킨 너겟 오리지널',
        price: 7979,
        originalPrice: 8980,
        quantity: 1,
        temperature: 'frozen',
      },
    ],
  },
];

export const MOCK_RECOMMEND: RecommendProductView[] = [
  { id: 'r-1', name: '[전주 베테랑] 고기만두', price: 10760, discountPercent: 10 },
  { id: 'r-2', name: '[KF365] 훈제오리 300g (150gx2입)', price: 6990, discountPercent: 33 },
  { id: 'r-3', name: '[KF365] 깐마늘 200g', price: 4100, discountPercent: 25 },
  { id: 'r-4', name: '[KF365] 대추방울토마토 750g', price: 9990, discountPercent: 22 },
  { id: 'r-5', name: '[상하농원] 암꽃게 간장게장', price: 2540 },
  { id: 'r-6', name: '[데체코] 구르메 파스타면 6종', price: 6980 },
  { id: 'r-7', name: '[동원] 고추참치 85g x 8캔', price: 13510 },
  { id: 'r-8', name: '[햇반] 찰현미 가득 단백질 흑미밥', price: 7180, discountPercent: 50 },
];
