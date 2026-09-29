import { type NextRequest } from 'next/server';

import { fail } from '@/lib/apiResponse';
import { isSameOrigin } from '@/lib/assertSameOrigin';
import { proxySpringCart } from '@/lib/cart/springProxy';
import { CartVoidResponseSchema, UpdateCartItemQuantityRequestSchema } from '@/types/cart';

/**
 * 장바구니 상품 수량 변경.
 * 경로 파라미터는 `productId` 다 — `CartController.updateItemQuantity`/`CartService` 가
 * `cartItemId` 가 아니라 `(cartId, productId)` 로 항목을 찾는다(2026-09-24 실 소스 확인).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  if (!isSameOrigin(req)) {
    return fail(403, '요청을 처리할 수 없습니다.');
  }

  const { productId } = await params;
  const productIdNum = Number(productId);
  if (!Number.isInteger(productIdNum) || productIdNum <= 0) {
    return fail(400, '올바르지 않은 상품 ID입니다.');
  }

  const parsed = UpdateCartItemQuantityRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return fail(400, '수량이 올바르지 않습니다.');
  }

  return proxySpringCart(req, `/api/v1/carts/items/${productIdNum}`, CartVoidResponseSchema, {
    method: 'PATCH',
    body: parsed.data,
    failureMessage: '수량 변경 중 오류가 발생했습니다.',
  });
}
