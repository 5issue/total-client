import { Suspense } from 'react';

import type { Metadata } from 'next';

import { CheckoutSuccessView } from '@/components/organisms/checkout/CheckoutSuccessView';

export const metadata: Metadata = { title: '결제 승인' };
export const dynamic = 'force-dynamic';

/**
 * Toss 위젯 successUrl (`paymentKey`, `orderId`, `amount`).
 * 클라가 승인 → 주문확정 후 `/checkout/complete?orderId=` 로 보낸다.
 * Access Token 이 메모리에만 있어(FE-05) 승인은 `privateFetch` 경로를 탄다.
 */
export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <p className="text-body-m text-fg-tertiary p-4" aria-live="polite">
          결제를 확인하고 있습니다.
        </p>
      }
    >
      <CheckoutSuccessView />
    </Suspense>
  );
}
