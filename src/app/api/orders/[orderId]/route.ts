import { type NextRequest } from 'next/server';

import { fail } from '@/lib/apiResponse';
import { proxySpringOrder } from '@/lib/order/springProxy';
import { OrderDetailResponseSchema } from '@/types/order';

/**
 * 주문 상세(주문 추적) 조회 — 상품·배송·결제 스냅샷 + 자체 취소 가능 여부(`selfCancelable`).
 * 결제 영수증 상세는 별도(`/api/payments/{paymentId}/receipt`, #109) — 여기선 요약만.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const orderIdNum = Number(orderId);
  if (!Number.isInteger(orderIdNum) || orderIdNum <= 0) {
    return fail(400, '올바르지 않은 주문 ID입니다.');
  }

  return proxySpringOrder(req, `/api/v1/orders/${orderIdNum}`, OrderDetailResponseSchema, {
    method: 'GET',
    failureMessage: '주문 상세 정보를 불러오는 중 오류가 발생했습니다.',
  });
}
