import { type NextRequest } from 'next/server';

import { fail } from '@/lib/apiResponse';
import { proxySpringOrder } from '@/lib/order/springProxy';
import { CheckoutOrderRequestSchema, CheckoutOrderResponseSchema } from '@/types/order';

/**
 * 주문서 생성(체크아웃) — 선택한 장바구니 상품으로 실제 주문을 만든다(#126).
 * 응답의 `reservationToken`/`expiresAt` 만큼 재고가 한시 예약되며, 그 안에 `place-order`
 * →결제까지 끝내야 한다.
 */
export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail(400, '요청 본문이 올바르지 않습니다.');
  }

  const parsed = CheckoutOrderRequestSchema.safeParse(json);
  if (!parsed.success) {
    return fail(400, '주문할 상품을 확인할 수 없습니다.');
  }

  return proxySpringOrder(req, '/api/v1/orders/checkout', CheckoutOrderResponseSchema, {
    method: 'POST',
    body: parsed.data,
    failureMessage: '주문서 생성 중 오류가 발생했습니다.',
  });
}
