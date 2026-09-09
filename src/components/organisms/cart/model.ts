import type { CartTemperature } from '@/components/molecules/cart/CartTemperatureSectionHeader';

/**
 * 장바구니 화면 표현용 뷰 모델 (퍼블리싱 단계).
 * API 스키마(`src/types/cart.ts`)와 별개 — 데이터 연동 시 파싱 계층에서 이 모양으로 정규화한다.
 */

export interface CartItemView {
  id: string;
  name: string;
  imageSrc?: string;
  /** 판매가(원). */
  price: number;
  /** 정가(원). 있으면 취소선. */
  originalPrice?: number;
  quantity: number;
  soldOut?: boolean;
  temperature: CartTemperature;
}

export interface CartDeliveryGroup {
  id: string;
  /** 배송 유형 라벨. 예: "샛별배송". */
  deliveryLabel: string;
  items: CartItemView[];
  /** 이 그룹 소계(원). */
  subtotalPrice: number;
  /** 배송비(원). 0 이면 "무료". */
  shippingFee: number;
}

export interface CartAmounts {
  /** 상품 금액 — 선택 상품의 정가 합계. */
  productPrice: number;
  /** 상품할인 금액 — (정가 − 판매가) 합계. */
  productDiscount: number;
  /** 쿠폰 할인 금액 합계(상품 쿠폰 + 장바구니 쿠폰). */
  couponDiscount: number;
  /** 상품 쿠폰 할인. */
  productCouponDiscount: number;
  /** 장바구니 쿠폰 할인. */
  cartCouponDiscount: number;
  shippingFee: number;
  /** 결제 예정 금액 = 상품 금액 − 상품할인 − 쿠폰할인 + 배송비. */
  total: number;
}

export interface RecommendProductView {
  id: string;
  name: string;
  imageSrc?: string;
  price: number;
  discountPercent?: number;
}
