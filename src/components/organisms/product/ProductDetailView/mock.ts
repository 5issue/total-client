import type { StaticOverviewFields } from '@/components/organisms/product/model';

/**
 * product-service 상세 응답에 없는 필드용 고정값(이슈 #134 범위 밖 — 원산지·후기건수·
 * 첫구매가·배송정보·멤버딜·재구매/미션 토스트는 다른 서비스 영역으로 추정, 후속 이슈에서
 * 실 데이터로 교체). Figma node 665:43037/665:43039 실측값 그대로("연세우유" 예시 상품,
 * 담기 바텀시트 mock(`ProductOptionSheet/mock.ts`)과 동일 상품이라 두 UI를 나란히 봐도
 * 값이 어긋나지 않는다). name/brandLabel/가격/썸네일은 `useProductDetail` 실 데이터로 대체됨
 * (`toProductDetailOverview`, `model.ts`).
 */
export const MOCK_STATIC_OVERVIEW_FIELDS: StaticOverviewFields = {
  memberDeal: true,
  recentRepurchaseCount: 6138,
  missionReward: {
    pointsLabel: '100P',
    description: '장바구니에 상품 담기 미션을 완료 했어요.',
  },
  shippingInfo: ' · 샛별배송  · 풀무원',
  subCopy: '가격, 퀄리티 모두 만족스러운 1A등급 우유',
  origin: '원산지: 상품설명/상세정보 참조',
  reviewCountLabel: '후기 30,042건',
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
