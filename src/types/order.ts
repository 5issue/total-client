import { z } from 'zod';

/**
 * 주문/반품 도메인 스키마 — BE 명세 기준(이슈 #115).
 *
 * - GET  /api/v1/orders                         주문 목록(주문 이력)
 * - GET  /api/v1/orders/{orderId}                주문 상세(주문 추적)
 * - POST /api/v1/orders/{orderId}/cancel         주문 취소(배송 전, 주문 추적)
 * - GET  /api/v1/orders/cancellations-returns    취소·반품 통합 내역(주문 추적)
 * - GET  /api/v1/orders/{orderId}/returns/preview 반품 접수 사전조회(환불 요청)
 * - POST /api/v1/orders/{orderId}/returns        반품 신청(환불 요청)
 *
 * 장바구니·주문서 생성·주문 결제 요청(/carts, /orders/checkout, /orders/place-order)은
 * 이번 작업 범위 밖 — 결제 자체는 #109(토스페이먼츠)가 별도로 다룬다.
 */

/** 주문 마스터 상태. `PAYMENT_PENDING` 표기 확정(백엔드 확인, 2026-09-18). */
export const OrderStatusSchema = z.enum([
  'CHECKOUT_CREATED',
  'PAYMENT_PENDING',
  'PAID',
  'CANCEL_PROCESSING',
  'CANCELLED',
  'EXPIRED',
  'RETURN_REQUESTED',
  'REFUNDED',
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

/** OMS 물류 진행 상태. */
export const FulfillmentStatusSchema = z.enum([
  'PROCESSING',
  'RELEASE_INSTRUCTED',
  'RELEASED',
  'COMPLETED',
]);

/** 배송 진행 상태. */
export const DeliveryStatusSchema = z.enum(['READY', 'IN_TRANSIT', 'DELIVERED']);

/** 주문 상품 1건 — 목록/상세 공통. */
export const OrderItemSchema = z.object({
  orderItemId: z.number().int().positive(),
  productId: z.number().int().positive(),
  skuId: z.number().int().positive(),
  deliveryType: z.string().min(1),
  title: z.string().min(1),
  thumbnailUrl: z.string().url().nullable(),
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

export const OrderListEntrySchema = z.object({
  orderId: z.number().int().positive(),
  orderNo: z.string().min(1),
  orderedAt: z.string().min(1),
  orderStatus: OrderStatusSchema,
  fulfillmentStatus: FulfillmentStatusSchema,
  deliveryStatus: DeliveryStatusSchema,
  expectedDeliveryAt: z.string().nullable(),
  deliveredAt: z.string().nullable(),
  totalPrice: z.number().nonnegative(),
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

export const OrderDetailInfoSchema = z.object({
  orderId: z.number().int().positive(),
  orderNo: z.string().min(1),
  orderedAt: z.string().min(1),
  orderStatus: OrderStatusSchema,
  sender: z.object({ name: z.string().min(1), phoneNumber: z.string().min(1) }),
});

export const OrderDeliveryInfoSchema = z.object({
  fulfillmentStatus: FulfillmentStatusSchema,
  deliveryStatus: DeliveryStatusSchema,
  expectedDeliveryAt: z.string().nullable(),
  deliveredAt: z.string().nullable(),
  receiver: z.object({ name: z.string().min(1), phoneNumber: z.string().min(1) }),
  address: z.object({
    postalCode: z.string().min(1),
    roadAddress: z.string().min(1),
    detailAddress: z.string().nullable(),
  }),
  pickupType: z.string().min(1),
  accessMethod: z.string().min(1),
  packingType: z.string().min(1),
  deliveryMessage: z.string().nullable(),
});

/** 결제 스냅샷만 — 영수증 상세는 결제 도메인(`types/checkout.ts`)에서 별도 조회. */
export const OrderPaymentSummarySchema = z.object({
  paymentId: z.number().int().positive(),
  paymentAmount: z.number().nonnegative(),
  paymentStatus: z.string().min(1),
});

export const OrderDetailResponseSchema = z.object({
  orderInfo: OrderDetailInfoSchema,
  items: z.array(OrderItemSchema),
  deliveryInfo: OrderDeliveryInfoSchema,
  paymentSummary: OrderPaymentSummarySchema,
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
