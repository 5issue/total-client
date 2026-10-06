import type { CartTemperature } from '@/components/molecules/cart/CartTemperatureSectionHeader';

/**
 * 장바구니 화면 표현용 뷰 모델 (퍼블리싱 단계).
 * API 스키마(`src/types/cart.ts`)와 별개 — 데이터 연동 시 파싱 계층에서 이 모양으로 정규화한다.
 */

export interface CartItemView {
  /** cartItemId(문자열화). 체크아웃 주문서 생성(`POST /orders/checkout`)이 이 값 그대로
   * `cartItemIds` 로 받는다(이슈 #126) — 그래서 선택(`selectedIds`)·"주문하기" 핸드오프는
   * 이 id를 그대로 쓴다. 수량변경·삭제 API는 반대로 productId가 필요해서(`CartService`
   * 확인) 그 두 뮤테이션 호출부만 `productId` 필드로 변환해서 보낸다. */
  id: string;
  /** 수량변경(`PATCH /cart/items/{productId}`)·삭제(`DELETE /cart/items`)에 쓴다. */
  productId: number;
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
  /**
   * 배송 유형 선택 여부. 상품 선택(`selectedIds`)과 무관한 별개 상태로, API 로 내려온다.
   * 이 체크박스는 배송 유형만 토글하고 그룹 내 상품 체크박스는 건드리지 않는다.
   */
  checked: boolean;
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
