import { type NextRequest } from 'next/server';

import { fail } from '@/lib/apiResponse';
import { proxySpringCheckout, RECEIPT_UPSTREAM_FAILURE_MESSAGE } from '@/lib/checkout/springProxy';
import { PaymentIdParamSchema, PaymentReceiptSchema } from '@/types/checkout';

/**
 * 영수증 조회 — 완료 화면 클라 재시도용.
 * Spring `GET /api/v1/payments/{payment_id}/receipt`. 본인 소유 검증은 Spring(FE-15).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> },
) {
  const parsed = PaymentIdParamSchema.safeParse((await params).paymentId);
  if (!parsed.success) {
    return fail(400, '결제 정보가 올바르지 않습니다.');
  }

  return proxySpringCheckout(req, `/api/v1/payments/${parsed.data}/receipt`, PaymentReceiptSchema, {
    method: 'GET',
    failureMessage: RECEIPT_UPSTREAM_FAILURE_MESSAGE,
  });
}
