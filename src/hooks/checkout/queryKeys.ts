/** checkout 도메인 쿼리 키 팩토리 (api-convention §4). */
export const checkoutKeys = {
  all: ['checkout'] as const,
  receipts: () => [...checkoutKeys.all, 'receipt'] as const,
  receipt: (paymentId: number) => [...checkoutKeys.receipts(), paymentId] as const,
};
