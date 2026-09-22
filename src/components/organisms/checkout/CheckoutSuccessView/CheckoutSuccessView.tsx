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
 * 카드 원본은 URL 에 오지 않고 paymentKey 만 온다.
 *
 * `orderId` — Toss 가 위젯 호출 때 넘긴 값을 successUrl 쿼리로 그대로 돌려준다.
 * `CheckoutView` 가 실제(또는 목) 숫자 주문 ID 를 문자열화해서 넘겼으므로, 여기서 다시
 * 숫자로 파싱해 승인 호출 본문에 싣는다(payment-service 필수값, types/checkout.ts 계약
 * 노트 참고, 2026-09-23).
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
    const orderIdRaw = searchParams.get('orderId');
    const orderId = orderIdRaw ? Number(orderIdRaw) : NaN;
    const paymentMethodParsed = SpringPaymentMethodSchema.safeParse(
      searchParams.get('paymentMethod') ?? 'CARD',
    );

    if (
      !paymentKey ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !Number.isInteger(orderId) ||
      orderId <= 0 ||
      !paymentMethodParsed.success
    ) {
      router.replace(`/checkout?payError=${encodeURIComponent('결제 정보가 올바르지 않습니다.')}`);
      return;
    }

    void (async () => {
      try {
        const result = await confirmPayment.mutateAsync({
          orderId,
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
