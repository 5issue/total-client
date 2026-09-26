import { z } from 'zod';

/**
 * 주문 도메인 스키마 — 체크아웃(주문서 생성·결제 요청)만 다룬다(이슈 #126).
 *
 * - POST /api/v1/orders/checkout     주문서 생성(체크아웃)
 * - POST /api/v1/orders/place-order  주문 결제 요청
 *
 * 주문 목록·상세·취소·반품(GET/POST /orders/**, /orders/{orderId}/**)은 이슈 #116 범위라
 * 이 파일엔 없다 — 그 작업이 develop에 먼저 머지되면 이 파일에 이어서 채운다. 장바구니
 * (/carts)는 #118, 결제 승인·영수증(/payments/**)은 #109 — `types/checkout.ts`.
 */

/**
 * 주문 마스터 상태. `PENDING_PAYMENT`(2026-09-19 실제 order-service `OrderStatus.java`
 * 소스로 확인).
 */
export const OrderStatusSchema = z.enum([
  'CHECKOUT_CREATED',
  'PENDING_PAYMENT',
  'PAID',
  'CANCEL_PROCESSING',
  'CANCELLED',
  'EXPIRED',
  'RETURN_REQUESTED',
  'REFUNDED',
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

// ── 주문서 생성 (POST /api/v1/orders/checkout) — 체크아웃(#126) ────────────

/** 장바구니에서 결제로 넘어갈 상품 id — 체크아웃 화면이 선택한 항목 그대로 보낸다. */
export const CheckoutOrderRequestSchema = z.object({
  cartItemIds: z.array(z.number().int().positive()).min(1),
});
export type CheckoutOrderRequest = z.infer<typeof CheckoutOrderRequestSchema>;

/**
 * 주문서 생성 응답의 상품 1건. `deliveryType`/`thumbnailUrl` 이 없다 — 백엔드
 * `OrderItemResponseDto`(order-service) 자체가 그 두 필드를 안 내려준다.
 */
export const CheckoutOrderItemSchema = z.object({
  orderItemId: z.number().int().positive(),
  productId: z.number().int().positive(),
  skuId: z.number().int().positive(),
  title: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  totalPrice: z.number().nonnegative(),
});
export type CheckoutOrderItem = z.infer<typeof CheckoutOrderItemSchema>;

/**
 * `reservationToken`/`expiresAt` — 재고를 한시적으로 예약한다. 이 시간 안에 `place-order`
 * →결제까지 끝내야 한다(화면의 `ORDER_TIME_LIMIT_MS` 로컬 타이머를 이 값으로 대체).
 */
export const CheckoutOrderResponseSchema = z.object({
  orderId: z.number().int().positive(),
  orderNo: z.string().min(1),
  reservationToken: z.string().min(1),
  expiresAt: z.string().min(1),
  paymentAmount: z.number().nonnegative(),
  items: z.array(CheckoutOrderItemSchema),
});
export type CheckoutOrderResponse = z.infer<typeof CheckoutOrderResponseSchema>;

// ── 주문 결제 요청 (POST /api/v1/orders/place-order) — 체크아웃(#126) ──────

/** 결제하기 직전 호출 — 주문을 결제 대기 상태로 전이시킨 뒤 토스 결제창을 연다. */
export const PlaceOrderRequestSchema = z.object({
  orderId: z.number().int().positive(),
});
export type PlaceOrderRequest = z.infer<typeof PlaceOrderRequestSchema>;

export const PlaceOrderResponseSchema = z.object({
  orderId: z.number().int().positive(),
  orderNo: z.string().min(1),
  status: OrderStatusSchema,
  expiresAt: z.string().min(1),
});
export type PlaceOrderResponse = z.infer<typeof PlaceOrderResponseSchema>;
