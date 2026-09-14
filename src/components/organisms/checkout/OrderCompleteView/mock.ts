import type { OrderRecommendProductView } from '@/components/organisms/checkout/OrderRecommendCarousel';

/**
 * 주문 완료 화면 스텁 데이터 (퍼블리싱 단계).
 * BE 주문 API 연동 전이라 화면 값은 전부 여기서 온다 — Figma node 666-26284 실측 그대로.
 */
export const MOCK_ORDER_NUMBER = '24242424224422';

/** 최종 결제금액(원). Figma 표기 `30,800 원`. */
export const MOCK_ORDER_TOTAL = 30_800;

/**
 * 추천 상품. 앞 6개는 Figma(node 666-26321~26327) 1페이지 실측 그대로다.
 * 2페이지는 Figma 에 없어(인디케이터만 `1/2`) 새로 지어내지 않고, 이미 저장소에 있는
 * 장바구니 추천 목 데이터(`organisms/cart/CartView/mock.ts`)에서 1페이지와 겹치지 않는
 * 항목만 가져왔다. 그래서 2페이지는 3개다.
 */
export const MOCK_ORDER_RECOMMEND: OrderRecommendProductView[] = [
  { id: 'r-1', name: '[타바스코] 스콜피온 엑스트라 핫소스 2종', priceLabel: '6,780원' },
  { id: 'r-2', name: '[동원] 고추참치 85g x 8캔', priceLabel: '13,510원', discountLabel: '20%' },
  {
    id: 'r-3',
    name: '[햇반] 찰현미 가득 단백질 주먹밥 3존 (택1)',
    priceLabel: '7,180원',
    discountLabel: '50%',
  },
  { id: 'r-4', name: '[상하농원] 암꽃게 간장게장', priceLabel: '49,500원' },
  { id: 'r-5', name: '[데체코] 구르메 파스타면 6종', priceLabel: '6,980원' },
  { id: 'r-6', name: '[KF365] 깐마늘 200g', priceLabel: '4,100원~', discountLabel: '25%' },
  { id: 'r-7', name: '[전주 베테랑] 고기만두', priceLabel: '10,760원', discountLabel: '10%' },
  {
    id: 'r-8',
    name: '[KF365] 훈제오리 300g (150gx2입)',
    priceLabel: '6,990원',
    discountLabel: '33%',
  },
  {
    id: 'r-9',
    name: '[KF365] 대추방울토마토 750g',
    priceLabel: '9,990원',
    discountLabel: '22%',
  },
];
