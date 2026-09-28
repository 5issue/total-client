import type { CancellationReturnParams, OrderListParams } from '@/types/order';

/** order 도메인 쿼리 키 팩토리 (api-convention §4). */
export const orderKeys = {
  all: ['order'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: OrderListParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (orderId: number) => [...orderKeys.details(), orderId] as const,
  cancellationsReturns: (params: CancellationReturnParams) =>
    [...orderKeys.all, 'cancellations-returns', params] as const,
  returnPreview: (orderId: number) => [...orderKeys.all, 'return-preview', orderId] as const,
};
