import { z } from 'zod';

/**
 * 결제 도메인 스키마 — BE 명세 기준 (#109).
 *
 * - POST `/api/v1/payments/checkout`  결제 승인 (Toss 시크릿은 Spring, FE-10)
 * - GET  `/api/v1/payments/{payment_id}/receipt`  영수증 (본인 소유 검증은 Spring, FE-15)
 * - POST `/internal/v1/payments/{payment_id}/cancel`  는 내부 API + 이슈 범위 밖(환불/취소)
 *
 * 주문서 생성·주문 확정 전용 엔드포인트는 명세에 없다. Toss `orderId` 는 클라가 발급한다.
 * 주문서 '다른 결제수단' UI 는 퍼블 그리드. 결제하기에서 토스 결제창을 연다.
 */

/** BE `paymentMethod` — 명세 예시는 `CARD`. 퍼블 선택값을 대문자로 매핑한다. */
export const SpringPaymentMethodSchema = z.enum(['CARD', 'PHONE', 'TOSSPAY', 'KAKAOPAY', 'PAYCO']);
export type SpringPaymentMethod = z.infer<typeof SpringPaymentMethodSchema>;

/** `POST /api/v1/payments/checkout` 요청 본문. Idempotency-Key 는 헤더. */
export const CheckoutPaymentRequestSchema = z.object({
  paymentMethod: SpringPaymentMethodSchema,
  paymentKey: z.string().min(1),
  /** 명세는 Decimal. 원화는 정수 원이지만 위변조 검증용으로 숫자만 강제한다. */
  amount: z.number().positive(),
});
export type CheckoutPaymentRequest = z.infer<typeof CheckoutPaymentRequestSchema>;

/**
 * 클라 → BFF. 본문에 idempotencyKey 를 실어 헤더로 올린다.
 * (같은 승인 재시도에 동일 UUID 가 필요해서 BFF 가 임의 생성하지 않는다.)
 */
export const ConfirmPaymentRequestSchema = CheckoutPaymentRequestSchema.extend({
  idempotencyKey: z.string().uuid(),
});
export type ConfirmPaymentRequest = z.infer<typeof ConfirmPaymentRequestSchema>;

/**
 * `POST /api/v1/payments/checkout` 성공 data.
 * 명세 샘플에는 `paymentId` 가 없지만 영수증 path 가 `{payment_id}` 라
 * 있으면 파싱하고, 목 응답에는 포함한다. 없으면 완료 화면으로 못 넘어간다.
 */
export const CheckoutPaymentResponseSchema = z.object({
  paymentCompletedAt: z.string().min(1),
  receiptUrl: z.string().url(),
  paymentStatus: z.string().min(1),
  paymentId: z.coerce.number().int().positive().optional(),
});
export type CheckoutPaymentResponse = z.infer<typeof CheckoutPaymentResponseSchema>;

/** `GET /api/v1/payments/{payment_id}/receipt` 성공 data. */
export const PaymentReceiptSchema = z.object({
  paymentId: z.coerce.number().int().positive(),
  orderId: z.coerce.number().int().positive(),
  paymentMethod: z.string().min(1),
  totalAmount: z.coerce.number().positive(),
  paymentCompletedAt: z.string().min(1),
  receiptUrl: z.string().url(),
});
export type PaymentReceipt = z.infer<typeof PaymentReceiptSchema>;

/** @deprecated 화면 호환 alias — 영수증은 PaymentReceipt. */
export type OrderReceipt = PaymentReceipt;

export const PaymentIdParamSchema = z.coerce.number().int().positive();
