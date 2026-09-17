/** 퍼블리싱용 더미 데이터 — Figma 예시(node 665:43562) 그대로, 두 옵션 모두 같은
 * 상품 텍스트를 쓴다(실제 다중 옵션은 옵션별로 이름이 다르겠지만 디자인 목업 자체가
 * 동일 텍스트 반복). API 연동 시 클릭한 상품의 옵션 목록으로 교체된다. */
export const MOCK_MULTI_OPTION_PRODUCT = {
  name: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
  tagline: '가격, 퀄리티 모두 만족스러운 1A등급 우유',
};

export type MultiOptionItem = {
  id: string;
  /** 없으면 일반 옵션(멤버십 무관 — + 클릭 시 바로 담긴다). */
  badgeLabel?: string;
  name: string;
  priceLabel: string;
  originalPriceLabel: string;
  unitPriceLabel: string;
};

export const MOCK_MULTI_OPTIONS: MultiOptionItem[] = [
  {
    id: 'option-1',
    badgeLabel: '멤버스',
    name: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
    priceLabel: '2,520원',
    originalPriceLabel: '3,400원',
    unitPriceLabel: '100g 당 360원',
  },
  {
    // 일반 옵션(멤버십 무관) — 단일 옵션 시트(ProductOptionSheet)의 상품과 동일한
    // 가격(2,780원/3,400원)으로, 뱃지 없음(사용자 확인 2026-09-16).
    id: 'option-2',
    name: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
    priceLabel: '2,780원',
    originalPriceLabel: '3,400원',
    unitPriceLabel: '100g 당 360원',
  },
];

export const MOCK_MULTI_OPTION_PROMOTION = {
  text: '첫 구매니까, 하나만 사도 ',
  emphasisText: '무료배송',
};
