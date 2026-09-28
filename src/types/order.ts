import { z } from 'zod';

/**
 * 주문 도메인 스키마 — 체크아웃(#126)과 주문/반품 조회(#115)를 함께 다룬다.
 *
 * - POST /api/v1/orders/checkout                  주문서 생성
 * - POST /api/v1/orders/place-order               주문 결제 요청
 * - GET  /api/v1/orders                           주문 목록(주문 이력)
 * - GET  /api/v1/orders/{orderId}                 주문 상세(주문 추적)
 * - POST /api/v1/orders/{orderId}/cancel          주문 취소(배송 전)
 * - GET  /api/v1/orders/cancellations-returns     취소·반품 통합 내역
 * - GET  /api/v1/orders/{orderId}/returns/preview 반품 접수 사전조회
 * - POST /api/v1/orders/{orderId}/returns         반품 신청
 *
 * 장바구니(/carts)는 #118, 결제 승인·영수증(/payments/**)은 #109 — `types/checkout.ts`.
 */

/**
 * 주문 마스터 상태. order-service `OrderStatus.java` 는 `PENDING_PAYMENT`(2026-09-19),
 * 주문 이력 연동(#115) 당시 확인값은 `PAYMENT_PENDING`(2026-09-18)이다. 둘 다 받아
 * 어느 표기가 오더라도 502로 죽지 않게 한다.
 */
export const OrderStatusSchema = z.enum([
  'CHECKOUT_CREATED',
  'PENDING_PAYMENT',
  'PAYMENT_PENDING',
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

/** OMS 물류 진행 상태. */
export const FulfillmentStatusSchema = z.enum([
  'PROCESSING',
  'RELEASE_INSTRUCTED',
  'RELEASED',
  'COMPLETED',
]);

/** 배송 진행 상태. */
export const DeliveryStatusSchema = z.enum(['READY', 'IN_TRANSIT', 'DELIVERED']);

/**
 * 주문 상품 1건 — 목록/상세 공통.
 *
 * `deliveryType`/`thumbnailUrl` 은 원래 스펙(이슈 #115) 기준으로 필수였으나, 실제
 * order-service 응답(`OrderItemResponseDto`)에는 없는 필드로 확인됐다(2026-09-23,
 * 실 백엔드 연동 검증). 백엔드가 아직 내려주지 않는 값이라 임시로 optional 처리 —
 * 백엔드에 필드가 추가되면 다시 필수로 되돌릴 것.
 */
export const OrderItemSchema = z.object({
  orderItemId: z.number().int().positive(),
  productId: z.number().int().positive(),
  skuId: z.number().int().positive(),
  deliveryType: z.string().optional(),
  title: z.string().min(1),
  thumbnailUrl: z.string().url().nullable().optional(),
  unitPrice: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  totalPrice: z.number().nonnegative(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

// ── 주문 이력 (GET /api/v1/orders) ──────────────────────────────────────────

export const OrderHistoryPeriodSchema = z.enum(['3M', '6M', '1Y', '3Y']);
export type OrderHistoryPeriod = z.infer<typeof OrderHistoryPeriodSchema>;

/** 목록 조회 파라미터 — `range` 는 대문자(Spring), 우리 UI 모델은 소문자라 apiClient 에서 매핑. */
export const OrderListParamsSchema = z.object({
  range: OrderHistoryPeriodSchema.optional(),
  productName: z.string().max(100).optional(),
  page: z.number().int().min(1).optional(),
  size: z.number().int().min(1).max(100).optional(),
});
export type OrderListParams = z.infer<typeof OrderListParamsSchema>;

/**
 * `fulfillmentStatus`/`deliveryStatus`/`expectedDeliveryAt`/`deliveredAt` 는 원래 스펙
 * 기준 필수였으나, 실제 `GET /api/v1/orders` 응답(`OrderResponseDto`)에는 없는 필드로
 * 확인됐다(2026-09-23) — order-service 엔티티엔 이미 있는 값이라 백엔드가 노출만 하면
 * 되지만, 지금은 FE 단독으로 optional 처리해 근사치(`orderStatus` 기반)로 상태를
 * 표시한다. `totalPrice` 도 응답에 없어 제거 — 목록 화면은 상품별 가격만 쓴다.
 */
export const OrderListEntrySchema = z.object({
  orderId: z.number().int().positive(),
  orderNo: z.string().min(1),
  orderedAt: z.string().min(1),
  orderStatus: OrderStatusSchema,
  fulfillmentStatus: FulfillmentStatusSchema.optional(),
  deliveryStatus: DeliveryStatusSchema.optional(),
  expectedDeliveryAt: z.string().nullable().optional(),
  deliveredAt: z.string().nullable().optional(),
  /** 목록 화면은 안 쓰지만, 상세(`OrderDetailResponseSchema.order`)가 같은 DTO를
   * 재사용해서 여기 있어야 한다. */
  paymentAmount: z.number().nonnegative(),
  totalQuantity: z.number().int().nonnegative(),
  items: z.array(OrderItemSchema),
});
export type OrderListEntry = z.infer<typeof OrderListEntrySchema>;

export const OrderListResponseSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  size: z.number().int().positive(),
  orders: z.array(OrderListEntrySchema),
});
export type OrderListResponse = z.infer<typeof OrderListResponseSchema>;

// ── 주문 상세 (GET /api/v1/orders/{orderId}) — 주문 추적 ───────────────────

/**
 * 원래 스펙(이슈 #115)은 `orderInfo`/`items`/`deliveryInfo`(수령인·주소·배송메시지)/
 * `paymentSummary` 중첩 구조를 기대했으나, 실제 백엔드 `OrderDetailResponseDto`
 * (`order-service` 소스 확인)는 훨씬 납작하다 — `order`(목록과 동일한 `OrderResponseDto`,
 * `OrderListEntrySchema` 재사용) + `paymentId`/`fulfillmentStatus`/`deliveryStatus`/
 * `selfCancelable` 뿐이다. 게다가 `getById()`는 배송지·수령인 정보(`order_delivery_info`)
 * 를 아예 조회하지 않아 그 데이터는 백엔드에 소스 자체가 없다(2026-09-23 확인, 백엔드
 * `OrderApi`/`OrderController` 파라미터 제약 불일치로 500 나던 것과는 별개 이슈).
 * 주소/수령인/배송메시지가 필요해지면 백엔드가 그 리포지토리 조회를 추가해야 한다.
 */
export const OrderDetailResponseSchema = z.object({
  order: OrderListEntrySchema,
  paymentId: z.number().int().positive(),
  fulfillmentStatus: FulfillmentStatusSchema.optional(),
  deliveryStatus: DeliveryStatusSchema.optional(),
  /** PAID + 출고 지시 이전 단계일 때만 true — 이 값으로 취소 버튼 노출 여부를 결정한다. */
  selfCancelable: z.boolean(),
});
export type OrderDetailResponse = z.infer<typeof OrderDetailResponseSchema>;

// ── 주문 취소 (POST /api/v1/orders/{orderId}/cancel) — 주문 추적(배송 전) ──

/** 취소 사유 코드(CNL01~05 선택, CNL99 는 reasonDetail 필수). */
export const OrderCancelReasonCodeSchema = z.enum([
  'CNL01',
  'CNL02',
  'CNL03',
  'CNL04',
  'CNL05',
  'CNL99',
]);
export type OrderCancelReasonCode = z.infer<typeof OrderCancelReasonCodeSchema>;

export const OrderCancelRequestSchema = z.object({
  reasonCode: OrderCancelReasonCodeSchema,
  reasonDetail: z.string().nullable().optional(),
});
export type OrderCancelRequest = z.infer<typeof OrderCancelRequestSchema>;

export const OrderCancelResponseSchema = z.object({
  cancellationId: z.number().int().positive(),
  orderId: z.number().int().positive(),
  cancellationStatus: z.string().min(1),
  refundAmount: z.number().nonnegative(),
  cancelledAt: z.string().min(1),
});
export type OrderCancelResponse = z.infer<typeof OrderCancelResponseSchema>;

// ── 취소·반품 통합 내역 (GET /api/v1/orders/cancellations-returns) — 주문 추적 ─

export const CancellationReturnRequestTypeSchema = z.enum(['CANCEL', 'RETURN']);
export type CancellationReturnRequestType = z.infer<typeof CancellationReturnRequestTypeSchema>;

export const CancellationReturnParamsSchema = z.object({
  requestType: CancellationReturnRequestTypeSchema.optional(),
  requestStatus: z.string().optional(),
  page: z.number().int().min(1).optional(),
  size: z.number().int().min(1).max(100).optional(),
});
export type CancellationReturnParams = z.infer<typeof CancellationReturnParamsSchema>;

export const CancellationReturnEntrySchema = z.object({
  requestType: CancellationReturnRequestTypeSchema,
  requestId: z.number().int().positive(),
  orderId: z.number().int().positive(),
  orderNo: z.string().min(1),
  requestStatus: z.string().min(1),
  refundStatus: z.string().min(1),
  refundAmount: z.number().nonnegative().nullable(),
  requestedAt: z.string().min(1),
  completedAt: z.string().nullable(),
  items: z.array(OrderItemSchema),
});
export type CancellationReturnEntry = z.infer<typeof CancellationReturnEntrySchema>;

export const CancellationReturnHistoryResponseSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  size: z.number().int().positive(),
  histories: z.array(CancellationReturnEntrySchema),
});
export type CancellationReturnHistoryResponse = z.infer<
  typeof CancellationReturnHistoryResponseSchema
>;

// ── 반품 접수 사전조회 (GET /api/v1/orders/{orderId}/returns/preview) — 환불 요청 ─

export const ReturnReasonCodeSchema = z.enum([
  'RTN01',
  'RTN02',
  'RTN03',
  'RTN04',
  'RTN05',
  'RTN06',
  'RTN07',
  'RTN08',
]);
export type ReturnReasonCode = z.infer<typeof ReturnReasonCodeSchema>;

export const ReturnReasonOptionSchema = z.object({
  code: ReturnReasonCodeSchema,
  displayName: z.string().min(1),
  attachmentRequired: z.boolean(),
});
export type ReturnReasonOption = z.infer<typeof ReturnReasonOptionSchema>;

export const ReturnPreviewResponseSchema = z.object({
  orderId: z.number().int().positive(),
  returnable: z.boolean(),
  /** 신선식품(냉장/냉동) 포함 여부 — true 면 RTN01(단순변심)이 reasonOptions 에서 이미 제외됨. */
  temperaturePolicy: z.string().nullable(),
  reasonOptions: z.array(ReturnReasonOptionSchema),
  refundPreview: z.object({
    paymentAmount: z.number().nonnegative(),
    deductionAmount: z.number().nonnegative(),
    expectedRefundAmount: z.number().nonnegative(),
  }),
  returnPolicy: z.object({
    collectionRequired: z.boolean(),
    guideMessage: z.string().min(1),
  }),
});
export type ReturnPreviewResponse = z.infer<typeof ReturnPreviewResponseSchema>;

// ── 반품 신청 (POST /api/v1/orders/{orderId}/returns) — 환불 요청 ──────────

export const OrderReturnRequestSchema = z.object({
  reasonCode: ReturnReasonCodeSchema,
  /** RTN 사유는 전부 자유 서술 허용(최대 500자) — 필수 여부는 화면에서 안내. */
  reasonDetail: z.string().max(500).optional(),
});
export type OrderReturnRequest = z.infer<typeof OrderReturnRequestSchema>;

export const OrderReturnResponseSchema = z.object({
  returnId: z.number().int().positive(),
  orderId: z.number().int().positive(),
  returnStatus: z.string().min(1),
  refundStatus: z.string().min(1),
  expectedRefundAmount: z.number().nonnegative(),
  requestedAt: z.string().min(1),
});
export type OrderReturnResponse = z.infer<typeof OrderReturnResponseSchema>;
