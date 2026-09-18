import { type NextRequest } from 'next/server';

import { fail } from '@/lib/apiResponse';
import { proxySpringOrder } from '@/lib/order/springProxy';
import { OrderHistoryPeriodSchema, OrderListResponseSchema } from '@/types/order';

/**
 * 내 주문 목록(주문 이력) 조회. `range`(3M/6M/1Y/3Y)·`productName`·`page`·`size` 그대로
 * 쿼리스트링에 실어 Spring 에 전달한다 — 검색/페이징 로직은 전부 BE 소유.
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const range = searchParams.get('range');
  if (range && !OrderHistoryPeriodSchema.safeParse(range).success) {
    return fail(400, '조회 기간 설정이 올바르지 않습니다.');
  }

  const query = new URLSearchParams();
  if (range) query.set('range', range);
  const productName = searchParams.get('productName');
  if (productName) query.set('productName', productName);
  const page = searchParams.get('page');
  if (page) query.set('page', page);
  const size = searchParams.get('size');
  if (size) query.set('size', size);
  const qs = query.toString();

  return proxySpringOrder(req, `/api/v1/orders${qs ? `?${qs}` : ''}`, OrderListResponseSchema, {
    method: 'GET',
    failureMessage: '주문 목록을 불러오는 중 오류가 발생했습니다.',
  });
}
