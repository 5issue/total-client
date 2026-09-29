import { Suspense } from 'react';

import type { Metadata } from 'next';

import { LoadingIndicator } from '@/components/atoms/LoadingIndicator';
import { CheckoutContainer, CheckoutView } from '@/components/organisms/checkout/CheckoutView';

export const metadata: Metadata = { title: '주문서' };

/**
 * 주문서(`/checkout`). 장바구니에서 선택한 상품 id(`?items=`)가 있으면 `CheckoutContainer`
 * 가 실제 주문서 생성 API로 채운다(이슈 #120/#126). 없으면(직접 진입·스토리북) 기존
 * 목데이터 `CheckoutView` 그대로 렌더. `CheckoutView` 내부가 `useSearchParams` 를 써서
 * (#109, 토스 successUrl 복귀) Suspense 경계가 필요하다.
 */
export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ items?: string }>;
}) {
  const { items: itemsParam } = await searchParams;
  const itemIds = itemsParam?.split(',').filter(Boolean) ?? [];

  return (
    <Suspense fallback={<LoadingIndicator label="주문서를 불러오는 중" />}>
      {itemIds.length === 0 ? <CheckoutView /> : <CheckoutContainer itemIds={itemIds} />}
    </Suspense>
  );
}
