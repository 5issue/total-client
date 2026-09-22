'use client';

import { useEffect } from 'react';

import { Button } from '@/components/atoms/Button';
import { ErrorToastBanner } from '@/components/molecules/shared/ErrorToastBanner';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { usePaymentReceipt } from '@/hooks/checkout/useOrderReceipt';
import { useTimedToast } from '@/hooks/useTimedToast';
import type { PaymentReceipt } from '@/types/checkout';

import { OrderCompleteView } from './OrderCompleteView';

const RECEIPT_ERROR_TOAST_DURATION_MS = 5000;
const RECEIPT_ERROR_MESSAGE = '주문 정보를 불러오지 못했습니다.';

/**
 * 완료 화면 컨테이너. SSR 영수증을 initialData 로 받고, 없거나 실패하면
 * `privateFetch` 로 재시도한다. 표현은 `OrderCompleteView` 가 맡는다.
 *
 * 조회 실패 메시지는 `CheckoutView`의 "배송 상세정보를 입력해주세요." 와 같은 상단 에러
 * 토스트(`ErrorToastBanner`)로 보여준다 — 재시도 버튼은 토스트가 사라진 뒤에도 남아있도록
 * 화면에 그대로 둔다(2026-09-23, fetch 에러 표시 방식 통일).
 */
export function OrderCompleteContainer({
  paymentId,
  initialReceipt,
}: {
  paymentId: number;
  initialReceipt?: PaymentReceipt;
}) {
  const receiptQuery = usePaymentReceipt(paymentId, { initialData: initialReceipt });
  const { visible: errorToastVisible, trigger: triggerErrorToast } = useTimedToast(
    RECEIPT_ERROR_TOAST_DURATION_MS,
  );

  useEffect(() => {
    if (receiptQuery.isError) triggerErrorToast();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 에러로 "전환"될 때만 트리거
  }, [receiptQuery.isError]);

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
        <ErrorToastBanner visible={errorToastVisible}>{RECEIPT_ERROR_MESSAGE}</ErrorToastBanner>
        <SectionHeader leading="close" leadingHref="/" title="주문 완료" />
        <div className="flex flex-col gap-4 p-4">
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
