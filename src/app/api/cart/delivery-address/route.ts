import { type NextRequest } from 'next/server';

import { fail } from '@/lib/apiResponse';
import { isSameOrigin } from '@/lib/assertSameOrigin';
import { proxySpringCart } from '@/lib/cart/springProxy';
import { DeliveryAddressRequestSchema, DeliveryAddressResponseSchema } from '@/types/cart';

/** 장바구니 배송지 변경 — 배송 가능 여부·예상 배송일을 함께 재계산해 받는다. */
export async function PUT(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return fail(403, '요청을 처리할 수 없습니다.');
  }

  const parsed = DeliveryAddressRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return fail(400, '배송지를 확인할 수 없습니다.');
  }

  return proxySpringCart(req, '/api/v1/carts/delivery-address', DeliveryAddressResponseSchema, {
    method: 'PUT',
    body: parsed.data,
    failureMessage: '배송지 변경 중 오류가 발생했습니다.',
  });
}
