import type { NextRequest } from 'next/server';
import type { ZodType } from 'zod';

import { fail, ok } from '@/lib/apiResponse';
import { env } from '@/lib/env';
import { AiEnvelopeSchema } from '@/types/ai';
import { AuthUserSchema } from '@/types/auth';

/** 스키마/네트워크 붕괴 시에만 쓰는 폴백. AI 서비스 `message` 가 있으면 그걸 우선한다(FE-16). */
export const AI_UPSTREAM_FAILURE_MESSAGE = '잠시 후 다시 시도해주세요.';

/**
 * AI 서비스는 Bearer 토큰이 아니라 숫자 `X-User-Id` 헤더로 사용자를 식별한다 — 우리
 * Route Handler 는 Bearer 토큰만 갖고 있으므로 Spring 에서 먼저 신원을 확인해 넘긴다.
 *
 * ⚠️ 정확한 Spring 엔드포인트 경로는 BE 확인 전이다 — `AuthUserSchema`(types/auth.ts)
 * 모양대로 `/api/v1/users/me` 로 가정했다. 다르면 이 함수만 고치면 된다.
 */
export async function resolveUserId(req: NextRequest): Promise<number | null> {
  const authorization = req.headers.get('authorization');
  if (!authorization) return null;

  try {
    const res = await fetch(`${env.API_INTERNAL_URL}/api/v1/users/me`, {
      headers: { Authorization: authorization },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const user = AuthUserSchema.parse(await res.json());
    return user.userId;
  } catch {
    return null;
  }
}

/**
 * AI 서비스(FastAPI) 호출 공통 처리 — 응답을 우리 봉투로 재포장한다(api-convention §6).
 * upstream 상태·에러 상세는 노출하지 않는다(FE-16). `raw.status`(SUCCESS/ERROR)만으로
 * 성공을 판정한다 — DELETE 처럼 성공해도 `data: null` 인 응답이 있어 `!raw.data` 같은
 * truthy 체크는 오판한다(Spring 프록시 `proxySpringCheckout` 과의 차이점).
 */
export async function fetchAiService<T>(
  path: string,
  dataSchema: ZodType<T>,
  init: { method: string; userId?: number | null; failureMessage?: string },
) {
  const failureMessage = init.failureMessage ?? AI_UPSTREAM_FAILURE_MESSAGE;
  let aiRes: Response;
  let raw;
  try {
    aiRes = await fetch(`${env.AI_SERVICE_INTERNAL_URL}${path}`, {
      method: init.method,
      headers: {
        'Content-Type': 'application/json',
        // 레시피 상세·부족 재료 추천처럼 비로그인도 허용하는 엔드포인트는 userId 가
        // 없을 수 있다(명세 §04-2 "헤더 X-User-Id 선택 — 없으면 냉장고 갈래 미사용").
        ...(init.userId != null ? { 'X-User-Id': String(init.userId) } : {}),
      },
      cache: 'no-store',
    });
    raw = AiEnvelopeSchema(dataSchema).parse(await aiRes.json());
  } catch {
    return fail(502, failureMessage);
  }

  if (raw.status === 'ERROR') {
    const status = aiRes.status >= 400 ? aiRes.status : 400;
    return fail(status, raw.message || failureMessage);
  }

  return ok(raw.data, raw.message, aiRes.status >= 200 && aiRes.status < 300 ? aiRes.status : 200);
}
