/**
 * 퍼블리싱용 더미 데이터 — Figma 예시 상품("연세우유", node 838:66058) 그대로.
 * 어떤 상품 카드의 "담기"를 눌러도 이 데이터로 고정 렌더한다(API 연동 전 단계).
 * 데이터 연동 시 클릭한 상품에 맞는 값으로 교체하는 훅이 이 자리를 대체한다.
 */
export const MOCK_ADD_TO_CART_PRODUCT = {
  name: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
  tagline: '가격, 퀄리티 모두 만족스러운 1A등급 우유',
  priceLabel: '2,780원',
  originalPriceLabel: '3,400원',
  unitPriceLabel: '100g 당 309원',
};

export const MOCK_ADD_TO_CART_PROMOTION = {
  text: '첫 구매니까, 하나만 사도 ',
  emphasisText: '무료배송',
};
