import { Suspense } from 'react';

import { CheckoutView } from '@/components/organisms/checkout/CheckoutView';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="text-body-m text-fg-tertiary p-4">주문서 로딩 중</div>}>
      <CheckoutView />
    </Suspense>
  );
}
