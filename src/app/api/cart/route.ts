import { type NextRequest } from 'next/server';

import { proxySpringCart } from '@/lib/cart/springProxy';
import { CartResponseSchema } from '@/types/cart';

/** 장바구니 조회(배송 그룹별). */
export async function GET(req: NextRequest) {
  return proxySpringCart(req, '/api/v1/carts', CartResponseSchema, {
    method: 'GET',
    failureMessage: '장바구니를 불러오는 중 오류가 발생했습니다.',
  });
}
