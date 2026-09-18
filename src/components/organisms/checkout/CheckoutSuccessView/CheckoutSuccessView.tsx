'use client';

import { useEffect, useRef } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { ApiError } from '@/errors/ApiError';
import { useConfirmPayment } from '@/hooks/checkout/useConfirmPayment';
import { createIdempotencyKey } from '@/lib/checkout/paymentMethod';
import { SpringPaymentMethodSchema } from '@/types/checkout';

/**
 * Toss successUrl 착지. 결제 승인 후 완료 화면으로 보낸다.
 * 주문 확정 전용 API 는 명세에 없다. 카드 원본은 URL 에 오지 않고 paymentKey 만 온다.
 */
export function CheckoutSuccessView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirmPayment = useConfirmPayment();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const paymentKey = searchParams.get('paymentKey');
    const amountRaw = searchParams.get('amount');
    const amount = amountRaw ? Number(amountRaw) : NaN;
    const paymentMethodParsed = SpringPaymentMethodSchema.safeParse(
      searchParams.get('paymentMethod') ?? 'CARD',
    );

    if (!paymentKey || !Number.isFinite(amount) || amount <= 0 || !paymentMethodParsed.success) {
      router.replace(`/checkout?payError=${encodeURIComponent('결제 정보가 올바르지 않습니다.')}`);
      return;
    }

    void (async () => {
      try {
        const result = await confirmPayment.mutateAsync({
          paymentMethod: paymentMethodParsed.data,
          paymentKey,
          amount,
          idempotencyKey: createIdempotencyKey(),
        });
        if (result.paymentId == null) {
          router.replace(
            `/checkout?payError=${encodeURIComponent('결제 식별자를 받지 못했습니다.')}`,
          );
          return;
        }
        router.replace(
          `/checkout/complete?paymentId=${encodeURIComponent(String(result.paymentId))}`,
        );
      } catch (error) {
        const message = error instanceof ApiError ? error.message : '결제 승인에 실패했습니다.';
        router.replace(`/checkout?payError=${encodeURIComponent(message)}`);
      }
    })();
  }, [confirmPayment, router, searchParams]);

  return (
    <div className="bg-surface flex flex-1 flex-col">
      <SectionHeader title="결제 승인" />
      <p className="text-body-m text-fg-tertiary p-4" aria-live="polite">
        결제를 확인하고 있습니다.
      </p>
    </div>
  );
}
