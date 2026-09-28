import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import type { ZodType } from 'zod';

import { fail, ok } from '@/lib/apiResponse';
import { env } from '@/lib/env';
import { AiEnvelopeSchema } from '@/types/ai';

/** 스키마/네트워크 붕괴 시에만 쓰는 폴백. AI 서비스 `message` 가 있으면 그걸 우선한다(FE-16). */
export const AI_UPSTREAM_FAILURE_MESSAGE = '잠시 후 다시 시도해주세요.';

/** 내부 서비스(Spring/AI) 호출이 무한 대기하지 않도록 두는 공통 타임아웃. */
const INTERNAL_FETCH_TIMEOUT_MS = 10_000;

/**
 * AI 서비스는 Bearer 토큰이 아니라 숫자 `X-User-Id` 헤더로 사용자를 식별한다(AI 파트
 * API 명세 v0.3 §02·§04). auth-service 확인 결과 "내 정보 조회" 같은 별도 API는 이
 * 아키텍처에 없다 — 각 서비스가 JWT의 `sub` 클레임을 직접 쓰는 구조라(auth-service
 * `UserController` 주석: "대상 회원은 항상 토큰의 sub에서 온다"), 우리도 Spring에
 * 왕복하지 않고 auth-service의 JWKS(`/.well-known/jwks.json`)로 토큰 서명을 직접
 * 검증해 `sub`를 꺼낸다. 서명 검증 없이 `sub`만 읽으면 위조 토큰이 통과하므로 반드시
 * `jwtVerify`를 거친다 — AI 서비스가 X-User-Id를 무조건 신뢰해서 더 위험하다.
 *
 * issuer/audience는 아직 안 맞춘다(배포 환경의 실제 값을 몰라서) — 서명 검증만으로도
 * 위조는 막지만, 값이 확정되면 `jwtVerify`에 `issuer`/`audience` 옵션을 추가한다.
 */
const getJwks = (() => {
  let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
  return () => {
    jwks ??= createRemoteJWKSet(new URL('/.well-known/jwks.json', env.API_INTERNAL_URL), {
      timeoutDuration: INTERNAL_FETCH_TIMEOUT_MS,
    });
    return jwks;
  };
})();

export async function resolveUserId(req: NextRequest): Promise<number | null> {
  const authorization = req.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return null;
  const token = authorization.slice('Bearer '.length);

  try {
    const { payload } = await jwtVerify(token, getJwks());
    const userId = Number(payload.sub);
    return Number.isFinite(userId) && userId > 0 ? userId : null;
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
  init: { method: string; userId: number; failureMessage?: string },
) {
  const failureMessage = init.failureMessage ?? AI_UPSTREAM_FAILURE_MESSAGE;
  let aiRes: Response;
  let raw;
  try {
    aiRes = await fetch(`${env.AI_SERVICE_INTERNAL_URL}${path}`, {
      method: init.method,
      headers: { 'Content-Type': 'application/json', 'X-User-Id': String(init.userId) },
      cache: 'no-store',
      signal: AbortSignal.timeout(INTERNAL_FETCH_TIMEOUT_MS),
    });
    raw = AiEnvelopeSchema(dataSchema).parse(await aiRes.json());
  } catch {
    return fail(502, failureMessage);
  }

  if (raw.status === 'ERROR') {
    const status = aiRes.status >= 400 ? aiRes.status : 400;
    return fail(status, raw.message || failureMessage);
  }

  // AiEnvelopeSchema는 ERROR·DELETE 같은 정상적인 null data(z.null() 엔드포인트 포함)를
  // 허용하려고 data를 통째로 nullable로 둔다 — 그래서 SUCCESS인데 이 엔드포인트 schema가
  // null을 허용하지 않는데도 upstream이 null을 보내는 계약 위반은 여기서 못 걸러낸다.
  // 여기서 실제 dataSchema로 한 번 더 검증해 그 경우를 502로 명확히 처리한다(코드래빗 리뷰).
  try {
    const data = dataSchema.parse(raw.data);
    return ok(data, raw.message, aiRes.status >= 200 && aiRes.status < 300 ? aiRes.status : 200);
  } catch {
    return fail(502, failureMessage);
  }
}
