import type { NextRequest } from 'next/server';
import type { ZodType } from 'zod';

import { fail, ok } from '@/lib/apiResponse';
import { getRefreshTokenCookie } from '@/lib/authCookies';
import { env } from '@/lib/env';
import { SpringEnvelopeSchema } from '@/types/auth';

/** 스키마/네트워크 붕괴 시에만 쓰는 폴백. Spring `message` 가 있으면 그걸 우선한다(FE-16). */
export const ADDRESS_UPSTREAM_FAILURE_MESSAGE = '배송지 정보를 불러오는 중 오류가 발생했습니다.';

/** Spring 이 응답하지 않아도 Route Handler 가 무한 대기하지 않도록 상한을 둔다. */
const SPRING_REQUEST_TIMEOUT_MS = 10_000;

export function springAddressHeaders(req: NextRequest): HeadersInit {
  const authorization = req.headers.get('authorization');
  const refresh = getRefreshTokenCookie(req);
  return {
    'Content-Type': 'application/json',
    ...(authorization ? { Authorization: authorization } : {}),
    ...(refresh ? { Cookie: `refresh_token=${refresh}` } : {}),
  };
}

/**
 * Spring 배송지 API 를 우리 봉투로 재포장한다.
 * HTTP 상태(400/401/403/404/409/…)는 Spring 것을 유지해 클라가 메시지를 그대로 보여준다.
 * (`lib/order/springProxy.ts`·`lib/cart/springProxy.ts` 와 같은 패턴 — 도메인 늘어나면 공용화 검토)
 */
export async function proxySpringAddress<T>(
  req: NextRequest,
  path: string,
  dataSchema: ZodType<T>,
  init: { method: string; body?: unknown; failureMessage?: string },
) {
  const failureMessage = init.failureMessage ?? ADDRESS_UPSTREAM_FAILURE_MESSAGE;
  let springRes: Response;
  let raw;
  try {
    springRes = await fetch(`${env.API_INTERNAL_URL}${path}`, {
      method: init.method,
      headers: springAddressHeaders(req),
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: 'no-store',
      signal: AbortSignal.timeout(SPRING_REQUEST_TIMEOUT_MS),
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
