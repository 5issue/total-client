import type { Metadata } from 'next';

import { CheckoutContainer, CheckoutView } from '@/components/organisms/checkout/CheckoutView';

export const metadata: Metadata = { title: '주문서' };

/**
 * 주문서(`/checkout`). 장바구니에서 선택한 상품 id(`?items=`)가 있으면 `CheckoutContainer`
 * 가 실제 장바구니·배송지 데이터로 채운다(이슈 #120). 없으면(직접 진입·스토리북) 기존
 * 목데이터 `CheckoutView` 그대로 렌더 — 결제 자체(#109)는 이 작업에서 손대지 않는다.
 */
export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ items?: string }>;
}) {
  const { items: itemsParam } = await searchParams;
  const itemIds = itemsParam?.split(',').filter(Boolean) ?? [];

  if (itemIds.length === 0) {
    return <CheckoutView />;
  }

  return <CheckoutContainer itemIds={itemIds} />;
}
