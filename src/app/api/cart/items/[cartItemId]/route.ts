import { type NextRequest } from 'next/server';

import { fail } from '@/lib/apiResponse';
import { proxySpringCart } from '@/lib/cart/springProxy';
import {
  UpdateCartItemQuantityRequestSchema,
  UpdateCartItemQuantityResponseSchema,
} from '@/types/cart';

/** 장바구니 상품 수량 변경. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ cartItemId: string }> },
) {
  const { cartItemId } = await params;
  const cartItemIdNum = Number(cartItemId);
  if (!Number.isInteger(cartItemIdNum) || cartItemIdNum <= 0) {
    return fail(400, '올바르지 않은 상품 ID입니다.');
  }

  const parsed = UpdateCartItemQuantityRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return fail(400, '수량이 올바르지 않습니다.');
  }

  return proxySpringCart(
    req,
    `/api/v1/carts/items/${cartItemIdNum}`,
    UpdateCartItemQuantityResponseSchema,
    {
      method: 'PATCH',
      body: parsed.data,
      failureMessage: '수량 변경 중 오류가 발생했습니다.',
    },
  );
}
