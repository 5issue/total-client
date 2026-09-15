import type { ProductDetailOverview } from '@/components/organisms/product/model';

/** 퍼블리싱용 더미 데이터 — 데이터 연동 시 훅(`useProductDetail`)이 대체한다.
 * Figma node 665:43037/665:43039 실측값 그대로("연세우유" 예시 상품, 담기 바텀시트
 * mock(`ProductOptionSheet/mock.ts`)과 동일 상품이라 두 UI를 나란히 봐도 값이 어긋나지 않는다). */
export const MOCK_PRODUCT_OVERVIEW: ProductDetailOverview = {
  memberDeal: true,
  brandLabel: 'KurlyOnly',
  shippingInfo: ' · 샛별배송  · 풀무원',
  name: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
  subCopy: '가격, 퀄리티 모두 만족스러운 1A등급 우유',
  origin: '원산지: 상품설명/상세정보 참조',
  reviewCountLabel: '후기 30,042건',
  discountRate: '25%',
  originalPriceLabel: '3,400',
  priceLabel: '2,780',
  specialPriceLabel: '1,390',
  specialPriceNote: '첫구매 최대혜택가',
  deliveryRows: [
    {
      label: '배송',
      value: '샛별배송 · 내일 아침',
      note: '23시 전 주문 시 수도권/충청 내일 아침 7시 전 도착, (그 외 지역 아침 8시 전 도착)',
    },
    { label: '배송비', value: '3,000원 (4만원 이상 무료)' },
    { label: '판매자', value: '컬리' },
    { label: '단위 당 가격', value: '100g 당 309원' },
  ],
};
