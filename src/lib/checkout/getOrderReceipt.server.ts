import 'server-only';

import { cookies } from 'next/headers';

import { RECEIPT_UPSTREAM_FAILURE_MESSAGE } from '@/lib/checkout/springProxy';
import { env } from '@/lib/env';
import { SpringEnvelopeSchema } from '@/types/auth';
import { PaymentReceiptSchema, type PaymentReceipt } from '@/types/checkout';

/**
 * `/checkout/complete` RSC 가 영수증을 직접 읽는다(structure §2 — SSR + 본인 검증).
 * Access Token 은 메모리에만 있어(FE-05) RSC 는 refresh 쿠키만 Spring 에 넘긴다.
 * 소유 검증·인가는 Spring. 실패하면 화면이 클라 `privateFetch` 로 재시도한다.
 */
export async function getPaymentReceiptOnServer(
  paymentId: number,
): Promise<{ ok: true; data: PaymentReceipt } | { ok: false; message: string }> {
  try {
    const cookieStore = await cookies();
    const refresh = cookieStore.get('refresh_token')?.value;
    const springRes = await fetch(`${env.API_INTERNAL_URL}/api/v1/payments/${paymentId}/receipt`, {
      headers: {
        'Content-Type': 'application/json',
        ...(refresh ? { Cookie: `refresh_token=${refresh}` } : {}),
      },
      cache: 'no-store',
    });
    const raw = SpringEnvelopeSchema(PaymentReceiptSchema).parse(await springRes.json());
    if (raw.status === 'ERROR' || !raw.data) {
      return { ok: false, message: raw.message || RECEIPT_UPSTREAM_FAILURE_MESSAGE };
    }
    return { ok: true, data: raw.data };
  } catch {
    return { ok: false, message: RECEIPT_UPSTREAM_FAILURE_MESSAGE };
  }
}
