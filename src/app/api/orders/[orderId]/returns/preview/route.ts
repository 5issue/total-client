import { type NextRequest } from 'next/server';

import { fail } from '@/lib/apiResponse';
import { proxySpringOrder } from '@/lib/order/springProxy';
import { ReturnPreviewResponseSchema } from '@/types/order';

/**
 * 반품 접수 사전조회 — 반품 접수 화면(`RefundReturnView`/`RefundReasonView`) 진입 시
 * 사유 옵션·예상 환불액·회수 정책을 먼저 받아온다. 조회 전용, 상태 변경 없음.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const orderIdNum = Number(orderId);
  if (!Number.isInteger(orderIdNum) || orderIdNum <= 0) {
    return fail(400, '올바르지 않은 주문 ID입니다.');
  }

  return proxySpringOrder(
    req,
    `/api/v1/orders/${orderIdNum}/returns/preview`,
    ReturnPreviewResponseSchema,
    { method: 'GET', failureMessage: '반품 접수 정보를 불러오는 중 오류가 발생했습니다.' },
  );
}
