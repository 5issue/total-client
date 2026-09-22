import { Suspense } from 'react';

import { LoadingIndicator } from '@/components/atoms/LoadingIndicator';
import { CheckoutView } from '@/components/organisms/checkout/CheckoutView';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingIndicator label="주문서를 불러오는 중" />}>
      <CheckoutView />
    </Suspense>
  );
}
