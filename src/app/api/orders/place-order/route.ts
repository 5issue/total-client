import { type NextRequest } from 'next/server';

import { fail } from '@/lib/apiResponse';
import { proxySpringOrder } from '@/lib/order/springProxy';
import { PlaceOrderRequestSchema, PlaceOrderResponseSchema } from '@/types/order';

/**
 * 주문 결제 요청 — 결제하기 직전 호출해 주문을 결제 대기 상태로 전이시킨다(#126).
 * 이 응답의 `orderId`/`expiresAt` 를 그대로 토스 결제창에 넘긴다.
 */
export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail(400, '요청 본문이 올바르지 않습니다.');
  }

  const parsed = PlaceOrderRequestSchema.safeParse(json);
  if (!parsed.success) {
    return fail(400, '올바르지 않은 주문입니다.');
  }

  return proxySpringOrder(req, '/api/v1/orders/place-order', PlaceOrderResponseSchema, {
    method: 'POST',
    body: parsed.data,
    failureMessage: '결제 요청 처리 중 오류가 발생했습니다.',
  });
}
