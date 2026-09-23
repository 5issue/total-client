import { z } from 'zod';

/**
 * 결제 도메인 스키마 — BE 명세 기준 (#109).
 *
 * - POST `/api/v1/payments/checkout`  결제 승인 (Toss 시크릿은 Spring, FE-10)
 * - GET  `/api/v1/payments/{payment_id}/receipt`  영수증 (본인 소유 검증은 Spring, FE-15)
 * - POST `/internal/v1/payments/{payment_id}/cancel`  는 내부 API + 이슈 범위 밖(환불/취소)
 *
 * ⚠️ 2026-09-23 재확인: payment-service 실제 스펙(`CheckoutRequest`)은 `orderId`(Long)가
 * 필수다 — order-service 가 발급한 실제 주문 ID 를 요구한다("orderId: 주문 ID는 필수입니다"
 * 400 으로 실측 확인). "주문서 생성 엔드포인트는 명세에 없다"는 이전 가정은 틀렸다 —
 * `POST /api/v1/orders/checkout`/`place-order` 가 이미 있다(주문서/장바구니 실연동, 이슈
 * #120 스코프 — 백엔드 이슈로 지연 중). 이 파일은 #120 이 실제 orderId 를 공급하기 시작하면
 * 그대로 맞물리도록 스키마·전달 경로만 미리 갖춰둔다 — 주문 생성 자체는 여기서 만들지 않는다.
 * Toss 쪽 `orderId`(문자열, 위젯에 넘기는 값)는 이 숫자 orderId 를 그대로 문자열화해 쓴다
 * (CheckoutView 참고) — successUrl 이 그걸 그대로 돌려주므로 승인 호출 때 다시 숫자로 되돌릴 수 있다.
 * 주문서 '다른 결제수단' UI 는 퍼블 그리드. 결제하기에서 토스 결제창을 연다.
 */

/** BE `paymentMethod` — 명세 예시는 `CARD`. 퍼블 선택값을 대문자로 매핑한다. */
export const SpringPaymentMethodSchema = z.enum(['CARD', 'PHONE', 'TOSSPAY', 'KAKAOPAY', 'PAYCO']);
export type SpringPaymentMethod = z.infer<typeof SpringPaymentMethodSchema>;

/** `POST /api/v1/payments/checkout` 요청 본문. Idempotency-Key 는 헤더. */
export const CheckoutPaymentRequestSchema = z.object({
  /** order-service 가 발급한 실제 주문 ID(Long) — 백엔드 필수값. */
  orderId: z.number().int().positive(),
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
