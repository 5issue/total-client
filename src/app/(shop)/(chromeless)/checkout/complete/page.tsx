import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { OrderCompleteContainer } from '@/components/organisms/checkout/OrderCompleteView';
import { getPaymentReceiptOnServer } from '@/lib/checkout/getOrderReceipt.server';
import { PaymentIdParamSchema } from '@/types/checkout';

export const metadata: Metadata = { title: '주문 완료' };
export const dynamic = 'force-dynamic';

/**
 * 주문 완료 (`/checkout/complete?paymentId=`) — 영수증 조회 API 를 SSR 로 읽고
 * 본인 소유는 Spring 이 검증한다(structure §2, FE-15). 쿼리 없으면 주문서로 되돌린다.
 */
export default async function CheckoutCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ paymentId?: string; orderId?: string }>;
}) {
  const params = await searchParams;
  const parsed = PaymentIdParamSchema.safeParse(params.paymentId ?? params.orderId);
  if (!parsed.success) {
    redirect(`/checkout?payError=${encodeURIComponent('주문 정보가 없습니다.')}`);
  }

  const receipt = await getPaymentReceiptOnServer(parsed.data);

  return (
    <OrderCompleteContainer
      paymentId={parsed.data}
      initialReceipt={receipt.ok ? receipt.data : undefined}
    />
  );
}
