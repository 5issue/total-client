import { type NextRequest } from 'next/server';

import { proxySpringOrder } from '@/lib/order/springProxy';
import { CancellationReturnHistoryResponseSchema } from '@/types/order';

/** 취소·반품 통합 내역 조회 — `CancelReturnExchangeHistoryView`가 쓴다. */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = new URLSearchParams();
  const requestType = searchParams.get('requestType');
  if (requestType) query.set('requestType', requestType);
  const requestStatus = searchParams.get('requestStatus');
  if (requestStatus) query.set('requestStatus', requestStatus);
  const page = searchParams.get('page');
  if (page) query.set('page', page);
  const size = searchParams.get('size');
  if (size) query.set('size', size);
  const qs = query.toString();

  return proxySpringOrder(
    req,
    `/api/v1/orders/cancellations-returns${qs ? `?${qs}` : ''}`,
    CancellationReturnHistoryResponseSchema,
    { method: 'GET', failureMessage: '취소·반품 내역을 불러오는 중 오류가 발생했습니다.' },
  );
}
