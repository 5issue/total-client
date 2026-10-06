import type { ProductUnit } from '@/types/product';

/** 퍼블리싱용 더미 데이터 — 혜택 배너 문구는 계약에 없는 마케팅 카피라 mock 유지. */
export const MOCK_ADD_TO_CART_PROMOTION = {
  text: '첫 구매니까, 하나만 사도 ',
  emphasisText: '무료배송',
};

/** 스토리/인터랙션 테스트 전용 픽스처 — 실 사용처(`ProductDetailInteractiveShell`)는
 * 상품 상세 응답의 실 SKU(`ProductUnit`)를 그대로 넘긴다. */
export const MOCK_OPTION_PRODUCT = {
  name: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
  tagline: '가격, 퀄리티 모두 만족스러운 1A등급 우유',
};

export const MOCK_UNIT: ProductUnit = {
  id: 1,
  name: MOCK_OPTION_PRODUCT.name,
  price: 3400,
  salePrice: 2780,
  status: 'SALE',
};
