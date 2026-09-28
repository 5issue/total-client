import { type NextRequest } from 'next/server';

import { fail } from '@/lib/apiResponse';
import { proxySpringOrder } from '@/lib/order/springProxy';
import { OrderCancelRequestSchema, OrderCancelResponseSchema } from '@/types/order';

/**
 * 주문 취소(배송 전) 신청 — `PAID` 상태이고 OMS 출고 지시 이전 단계일 때만 허용된다
 * (Spring 이 `selfCancelable`/`cancel-eligibility` 로 검증). 부분 취소는 지원하지 않는다.
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

  const parsed = OrderCancelRequestSchema.safeParse(json);
  if (!parsed.success) {
    return fail(400, '취소 사유가 올바르지 않습니다.');
  }

  return proxySpringOrder(req, `/api/v1/orders/${orderIdNum}/cancel`, OrderCancelResponseSchema, {
    method: 'POST',
    body: parsed.data,
    failureMessage: '취소 처리 중 오류가 발생했습니다.',
  });
}
