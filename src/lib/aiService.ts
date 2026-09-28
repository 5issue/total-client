import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import type { ZodType } from 'zod';

import { fail, ok } from '@/lib/apiResponse';
import { env } from '@/lib/env';
import { AiEnvelopeSchema } from '@/types/ai';

/** 스키마/네트워크 붕괴 시에만 쓰는 폴백. AI 서비스 `message` 가 있으면 그걸 우선한다(FE-16). */
export const AI_UPSTREAM_FAILURE_MESSAGE = '잠시 후 다시 시도해주세요.';

/**
 * AI 서비스는 Bearer 토큰이 아니라 숫자 `X-User-Id` 헤더로 사용자를 식별한다. auth-service
 * 확인 결과 "내 정보 조회" API는 이 아키텍처에 없다 — 각 서비스가 JWT의 `sub` 클레임을
 * 직접 쓰는 구조라(`UserController` 주석: "대상 회원은 항상 토큰의 sub에서 온다"), 우리도
 * Spring에 왕복하지 않고 auth-service의 JWKS(`/.well-known/jwks.json`)로 토큰 서명을
 * 직접 검증해 `sub`를 꺼낸다(2026-09-28 확인). 서명 검증 없이 `sub`만 읽으면 위조 토큰이
 * 통과하므로 반드시 `jwtVerify`를 거친다 — AI 서비스가 X-User-Id를 무조건 신뢰해서 더 위험하다.
 *
 * issuer/audience는 아직 안 맞춘다(배포 환경의 실제 값을 몰라서) — 서명 검증만으로도
 * 위조는 막지만, 값이 확정되면 `jwtVerify`에 `issuer`/`audience` 옵션을 추가한다.
 */
const getJwks = (() => {
  let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
  return () => {
    jwks ??= createRemoteJWKSet(new URL('/.well-known/jwks.json', env.API_INTERNAL_URL));
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
