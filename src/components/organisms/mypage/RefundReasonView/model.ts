/** 반품 사유 화면에 들어오는 상품 1건. `/mypage/orders/return` 에서 체크한 항목이 전달된다. */
export interface RefundReasonItemInput {
  id: string;
  name: string;
  imageSrc?: string;
  price: number;
  quantity: number;
}
