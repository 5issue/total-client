/**
 * 주문서(체크아웃) 화면 표시 모델 (퍼블리싱 단계).
 * API 스키마가 아니라 화면용 타입만 둔다 — 데이터 연동 시 파싱 계층에서 이 모양으로 정규화.
 */

/** 주문상품 한 줄 (바로구매 흐름이라 항상 1건). Figma `Item_H_Order`. */
export interface OrderLineItemView {
  id: string;
  name: string;
  imageSrc?: string;
  /** 판매가(원). */
  price: number;
  /** 정가(원). 있으면 취소선. */
  originalPrice?: number;
  quantity: number;
}

/**
 * 결제금액 상세. `organisms/cart/model.ts` 의 `CartAmounts` 와 상품/쿠폰/배송비 항목은
 * 같은 모양이지만, 주문서는 카드 즉시할인·적립금·컬리캐시 사용액이 더 있고 합계 라벨도
 * "결제예정금액"이 아니라 "최종 결제금액"이라 별도 타입으로 둔다(구조만 유사, 도메인 분리).
 */
export interface OrderAmounts {
  /** 주문 금액 — 상품금액 합계(= productPrice, 상단 헤더 값과 동일). */
  productPrice: number;
  /** 상품할인 금액 — (정가 − 판매가) 합계. */
  productDiscount: number;
  shippingFee: number;
  /** 쿠폰 할인 금액 합계(상품 쿠폰 + 장바구니 쿠폰). */
  couponDiscount: number;
  productCouponDiscount: number;
  cartCouponDiscount: number;
  cardInstantDiscount: number;
  /** 적립금·컬리캐시 사용액 합계. */
  pointsCashUsed: number;
  pointsUsed: number;
  cashUsed: number;
  /** 최종 결제금액 = 상품금액 − 상품할인 − 쿠폰할인 − 카드즉시할인 − 적립금·컬리캐시 사용액 + 배송비. */
  total: number;
}

/** 결제수단 1차 선택(라디오그룹). */
export type PaymentMethodId = 'charge' | 'kurlypay' | 'naverpay' | 'other';

/** "다른 결제수단" 펼침 안의 2차 선택. */
export type OtherPaymentMethodId = 'card' | 'phone' | 'tosspay' | 'kakaopay' | 'payco';
