import { NextResponse } from 'next/server';

/**
 * 우리 자신의 `/api/**` Route Handler 가 브라우저에 내려주는 공용 응답 봉투.
 * (api-convention §6. Spring 백엔드의 원본 봉투 `{status,message,data,error,timestamp}` 와는 다르다 —
 *  그건 `types/auth.ts` 의 `SpringEnvelopeSchema` 가 표현한다. Route Handler 가 그 사이를 변환한다.)
 */
export type ApiEnvelope<T> = { statusCode: number; message: string; data: T };

/**
 * 배포 환경에서 CloudFront가 이 응답을 캐싱한 게 실제로 확인됐다(2026-09-30) — GET
 * 요청(`/api/cart` 등)이 한 번 401을 내려받으면 그 뒤로는 유효한 Authorization을
 * 실어 보내도 CloudFront가 캐시된 401을 그대로 돌려줘 "POST인 /api/auth/refresh만
 * 정상, 나머지 GET 은 전부 401"로 보였다(`x-cache: Error from cloudfront` 로 확인).
 * 인증이 실린 개인화 응답은 어떤 CDN/프록시도 캐싱하면 안 되므로 명시적으로 막는다.
 */
const NO_STORE_HEADERS = { 'Cache-Control': 'private, no-store' };

export function ok<T>(data: T, message = 'OK', statusCode = 200) {
  return NextResponse.json<ApiEnvelope<T>>(
    { statusCode, message, data },
    { status: statusCode, headers: NO_STORE_HEADERS },
  );
}

export function fail(statusCode: number, message: string) {
  return NextResponse.json<ApiEnvelope<null>>(
    { statusCode, message, data: null },
    { status: statusCode, headers: NO_STORE_HEADERS },
  );
}
