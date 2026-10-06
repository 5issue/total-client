'use client';

import { useEffect, useRef } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { LoadingIndicator } from '@/components/atoms/LoadingIndicator';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { ApiError } from '@/errors/ApiError';
import { useConfirmPayment } from '@/hooks/checkout/useConfirmPayment';
import { createIdempotencyKey } from '@/lib/checkout/paymentMethod';
import { SpringPaymentMethodSchema } from '@/types/checkout';

/**
 * Toss successUrl 착지. 결제 승인 후 완료 화면으로 보낸다.
 * 카드 원본은 URL 에 오지 않고 paymentKey 만 온다.
 *
 * Toss 가 successUrl 쿼리로 돌려주는 `orderId` 는 우리가 넘긴 토스 쪽 `orderId`(실 주문은
 * 서버 `orderNo`, `"O"+UUID` 형태 — 숫자가 아니다) 를 그대로 echo 한 값이라, 승인 호출에
 * 필요한 우리 숫자 주문 PK 와는 다른 값이다. 그 PK 는 `CheckoutView` 가 `internalOrderId`
 * 쿼리로 별도로 실어 보낸 걸 읽는다(이슈 #195 — 전에는 이 둘을 같은 값으로 착각해
 * `Number(orderNo)` 가 항상 NaN 이 되는 바람에 결제가 실제로 성공해도 매번 실패 처리됐다).
 *
 * 쿼리 검증 실패·승인 실패 모두 주문서가 아니라 `/cart`로 돌려보낸다(#193) — Toss가 결제를
 * 승인했어도 우리 쪽 확정(confirm)이 실패하면 주문서에 다시 둬도 이어갈 방법이 없다.
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
    const internalOrderIdRaw = searchParams.get('internalOrderId');
    const orderId = internalOrderIdRaw ? Number(internalOrderIdRaw) : NaN;
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
      router.replace(`/cart?orderError=${encodeURIComponent('결제 정보가 올바르지 않습니다.')}`);
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
            `/cart?orderError=${encodeURIComponent('결제 식별자를 받지 못했습니다.')}`,
          );
          return;
        }
        router.replace(
          `/checkout/complete?paymentId=${encodeURIComponent(String(result.paymentId))}`,
        );
      } catch (error) {
        const message = error instanceof ApiError ? error.message : '결제 승인에 실패했습니다.';
        router.replace(`/cart?orderError=${encodeURIComponent(message)}`);
      }
    })();
  }, [confirmPayment, router, searchParams]);

  return (
    <div className="bg-surface flex flex-1 flex-col">
      <SectionHeader title="결제 승인" />
      <LoadingIndicator label="결제를 확인하고 있습니다" className="flex-1" />
    </div>
  );
}
