import { type NextRequest } from 'next/server';

import { fail } from '@/lib/apiResponse';
import { proxySpringCheckout } from '@/lib/checkout/springProxy';
import { CheckoutPaymentRequestSchema, CheckoutPaymentResponseSchema } from '@/types/checkout';

/**
 * 결제 승인 — Toss `successUrl` 착지 후 `useConfirmPayment` 가 호출.
 * Spring `POST /api/v1/payments/checkout`. 시크릿·카드 원본은 Next 가 안 쥐다(FE-01·FE-10).
 */
export async function POST(req: NextRequest) {
  const idempotencyKey = req.headers.get('idempotency-key') ?? req.headers.get('idemopotency-key');
  if (!idempotencyKey) {
    return fail(400, '요청이 올바르지 않습니다.');
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail(400, '요청 본문이 올바르지 않습니다.');
  }

  const parsed = CheckoutPaymentRequestSchema.safeParse(json);
  if (!parsed.success) {
    return fail(400, '결제 정보가 올바르지 않습니다.');
  }

  return proxySpringCheckout(req, '/api/v1/payments/checkout', CheckoutPaymentResponseSchema, {
    method: 'POST',
    body: parsed.data,
  });
}
