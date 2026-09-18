'use client';

import { Button } from '@/components/atoms/Button';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { usePaymentReceipt } from '@/hooks/checkout/useOrderReceipt';
import type { PaymentReceipt } from '@/types/checkout';

import { OrderCompleteView } from './OrderCompleteView';

/**
 * 완료 화면 컨테이너. SSR 영수증을 initialData 로 받고, 없거나 실패하면
 * `privateFetch` 로 재시도한다. 표현은 `OrderCompleteView` 가 맡는다.
 */
export function OrderCompleteContainer({
  paymentId,
  initialReceipt,
}: {
  paymentId: number;
  initialReceipt?: PaymentReceipt;
}) {
  const receiptQuery = usePaymentReceipt(paymentId, { initialData: initialReceipt });

  if (receiptQuery.isLoading && !receiptQuery.data) {
    return (
      <div className="bg-surface-secondary flex flex-1 flex-col">
        <SectionHeader leading="close" leadingHref="/" title="주문 완료" />
        <p className="text-body-m text-fg-tertiary p-4" aria-live="polite">
          주문 정보를 불러오는 중입니다.
        </p>
      </div>
    );
  }

  if (receiptQuery.isError || !receiptQuery.data) {
    return (
      <div className="bg-surface-secondary flex flex-1 flex-col">
        <SectionHeader leading="close" leadingHref="/" title="주문 완료" />
        <div className="flex flex-col gap-4 p-4">
          <p className="text-body-m text-fg">주문 정보를 불러오지 못했습니다.</p>
          <Button variant="primary" onClick={() => void receiptQuery.refetch()}>
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <OrderCompleteView
      orderNumber={String(receiptQuery.data.orderId)}
      total={receiptQuery.data.totalAmount}
    />
  );
}
