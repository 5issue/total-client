import type { NextRequest } from 'next/server';
import type { ZodType } from 'zod';

import { fail, ok } from '@/lib/apiResponse';
import { getRefreshTokenCookie } from '@/lib/authCookies';
import { env } from '@/lib/env';
import { SpringEnvelopeSchema } from '@/types/auth';

/** 스키마/네트워크 붕괴 시에만 쓰는 폴백. Spring `message` 가 있으면 그걸 우선한다(FE-16). */
export const CHECKOUT_UPSTREAM_FAILURE_MESSAGE =
  '결제 승인 중 오류가 발생했습니다. 다시 시도해주세요.';
export const RECEIPT_UPSTREAM_FAILURE_MESSAGE = '주문 상세 정보를 불러오는 중 오류가 발생했습니다.';

export function springCheckoutHeaders(req: NextRequest): HeadersInit {
  const authorization = req.headers.get('authorization');
  const refresh = getRefreshTokenCookie(req);
  const idempotencyKey = req.headers.get('idempotency-key') ?? req.headers.get('idemopotency-key');
  return {
    'Content-Type': 'application/json',
    ...(authorization ? { Authorization: authorization } : {}),
    ...(refresh ? { Cookie: `refresh_token=${refresh}` } : {}),
    ...(idempotencyKey
      ? {
          'Idempotency-Key': idempotencyKey,
          // 명세 오탈자. BE 가 이 헤더명을 쓰면 같이 보낸다.
          'Idemopotency-Key': idempotencyKey,
        }
      : {}),
  };
}

/**
 * Spring 결제 API 를 우리 봉투로 재포장한다. paymentKey 원본은 로그하지 않는다(FE-03).
 * HTTP 상태(400/401/402/409/…)는 Spring 것을 유지해 클라가 메시지를 그대로 보여준다.
 */
export async function proxySpringCheckout<T>(
  req: NextRequest,
  path: string,
  dataSchema: ZodType<T>,
  init: { method: string; body?: unknown; failureMessage?: string },
) {
  const failureMessage = init.failureMessage ?? CHECKOUT_UPSTREAM_FAILURE_MESSAGE;
  let springRes: Response;
  let raw;
  try {
    springRes = await fetch(`${env.API_INTERNAL_URL}${path}`, {
      method: init.method,
      headers: springCheckoutHeaders(req),
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: 'no-store',
    });
    raw = SpringEnvelopeSchema(dataSchema).parse(await springRes.json());
  } catch {
    return fail(502, failureMessage);
  }

  if (raw.status === 'ERROR' || !raw.data) {
    const status = springRes.status >= 400 ? springRes.status : 400;
    return fail(status, raw.message || failureMessage);
  }

  return ok(
    raw.data,
    raw.message,
    springRes.status >= 200 && springRes.status < 300 ? springRes.status : 200,
  );
}
