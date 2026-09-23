import { type NextRequest } from 'next/server';

import { fail } from '@/lib/apiResponse';
import { isSameOrigin } from '@/lib/assertSameOrigin';
import { proxySpringCart } from '@/lib/cart/springProxy';
import {
  AddCartItemsRequestSchema,
  CartResponseSchema,
  RemoveCartItemsRequestSchema,
  RemoveCartItemsResponseSchema,
} from '@/types/cart';

/** 장바구니 상품 담기 — 다건(`items` 배열). 이미 담긴 상품이면 서버가 수량을 합산한다. */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return fail(403, '요청을 처리할 수 없습니다.');
  }

  const parsed = AddCartItemsRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return fail(400, '담을 상품을 확인할 수 없습니다.');
  }

  return proxySpringCart(req, '/api/v1/carts/items', CartResponseSchema, {
    method: 'POST',
    body: parsed.data,
    failureMessage: '상품 담기 중 오류가 발생했습니다.',
  });
}

/** 장바구니 상품 삭제 — 단일·다건 공통(`productIds` 배열). */
export async function DELETE(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return fail(403, '요청을 처리할 수 없습니다.');
  }

  const parsed = RemoveCartItemsRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return fail(400, '삭제할 상품을 확인할 수 없습니다.');
  }

  return proxySpringCart(req, '/api/v1/carts/items', RemoveCartItemsResponseSchema, {
    method: 'DELETE',
    body: parsed.data,
    failureMessage: '상품 삭제 중 오류가 발생했습니다.',
  });
}
