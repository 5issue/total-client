import { type NextRequest } from 'next/server';

import { fail } from '@/lib/apiResponse';
import { proxySpringOrder } from '@/lib/order/springProxy';
import { OrderReturnRequestSchema, OrderReturnResponseSchema } from '@/types/order';

/**
 * 전체 주문 반품 신청 — 배송 완료(`DELIVERED`) 주문에만 허용된다(Spring 이 검증).
 * 부분 반품은 지원하지 않는다(BE 명세). 신선식품 포함 시 `RTN01`(단순변심)은
 * Spring 쪽에서 422 `FRESH_FOOD_RETURN_RESTRICTED` 로 막는다 — 프론트는 그대로 노출.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const orderIdNum = Number(orderId);
  if (!Number.isInteger(orderIdNum) || orderIdNum <= 0) {
    return fail(400, '올바르지 않은 주문 ID입니다.');
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail(400, '요청 본문이 올바르지 않습니다.');
  }

  const parsed = OrderReturnRequestSchema.safeParse(json);
  if (!parsed.success) {
    return fail(400, '반품 사유가 올바르지 않습니다.');
  }

  return proxySpringOrder(req, `/api/v1/orders/${orderIdNum}/returns`, OrderReturnResponseSchema, {
    method: 'POST',
    body: parsed.data,
    failureMessage: '반품 신청 중 오류가 발생했습니다. 다시 시도해주세요.',
  });
}
