import { type NextRequest } from 'next/server';

import { fail } from '@/lib/apiResponse';
import { proxySpringCheckout } from '@/lib/checkout/springProxy';
import { CheckoutPaymentResponseSchema, ConfirmPaymentRequestSchema } from '@/types/checkout';

/**
 * 결제 승인 — Toss `successUrl` 착지 후 `useConfirmPayment` 가 호출.
 * Spring `POST /api/v1/payments/checkout`. 시크릿·카드 원본은 Next 가 안 쥐다(FE-01·FE-10).
 *
 * `idempotencyKey` 는 헤더가 아니라 본문으로 받는다 — 전에는 `Idempotency-Key` 헤더로
 * 받았는데, CloudFront가 브라우저→우리 서버 구간에서 커스텀 헤더를 걸러내 여기서 못
 * 받는 사례가 확인됐다(이슈 #197, 매 결제 승인 400). 서버→Spring 구간(`springCheckoutHeaders`)
 * 은 CloudFront를 안 거치므로 거기서 헤더로 다시 실어 보낸다.
 */
export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail(400, '요청 본문이 올바르지 않습니다.');
  }

  const parsed = ConfirmPaymentRequestSchema.safeParse(json);
  if (!parsed.success) {
    return fail(400, '결제 정보가 올바르지 않습니다.');
  }

  const { idempotencyKey, ...checkoutBody } = parsed.data;
  return proxySpringCheckout(req, '/api/v1/payments/checkout', CheckoutPaymentResponseSchema, {
    method: 'POST',
    body: checkoutBody,
    idempotencyKey,
  });
}
