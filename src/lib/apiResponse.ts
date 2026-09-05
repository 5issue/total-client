import { NextResponse } from 'next/server';

/**
 * 우리 자신의 `/api/**` Route Handler 가 브라우저에 내려주는 공용 응답 봉투.
 * (api-convention §6. Spring 백엔드의 원본 봉투 `{status,message,data,error,timestamp}` 와는 다르다 —
 *  그건 `types/auth.ts` 의 `SpringEnvelopeSchema` 가 표현한다. Route Handler 가 그 사이를 변환한다.)
 */
export type ApiEnvelope<T> = { statusCode: number; message: string; data: T };

export function ok<T>(data: T, message = 'OK', statusCode = 200) {
  return NextResponse.json<ApiEnvelope<T>>({ statusCode, message, data }, { status: statusCode });
}

export function fail(statusCode: number, message: string) {
  return NextResponse.json<ApiEnvelope<null>>(
    { statusCode, message, data: null },
    { status: statusCode },
  );
}
