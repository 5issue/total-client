import type { ZodType } from 'zod';

import { ApiError } from '@/errors/ApiError';
import type { ApiEnvelope } from '@/lib/apiResponse';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/authTokenRef';

/**
 * HTTP 클라이언트 — publicFetch / privateFetch (api-convention §3).
 *
 * 두 래퍼 모두 "우리 자신의" `/api/**` Route Handler 만 호출한다. Spring 백엔드는 절대
 * 브라우저에서 직접 부르지 않는다 — Route Handler 가 서버에서 대신 호출한다(각 route.ts 안 로직).
 * 응답은 항상 우리 공용 봉투 `{ statusCode, message, data }`(apiResponse.ts, §6) 이므로
 * 여기서 data 만 꺼내(`unwrap`) 도메인 Zod 스키마로 검증한 뒤 반환한다.
 *
 * ⚠️ 현재 구현은 브라우저(클라이언트 컴포넌트) 호출을 기준으로 한다. 서버(RSC)에서 우리 자신의
 * `/api/**` 를 절대경로 없이 self-fetch 하려면 별도의 서버 전용 base URL 처리가 필요하다 —
 * 이 도메인(auth)은 아직 그 경로를 안 타므로 이번 구현 범위에서는 다루지 않는다.
 */

function baseHeaders(init?: RequestInit): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...init?.headers,
  };
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  return envelope.data;
}

/** 인증 불필요 — 우리 `/api/**` 호출. */
export async function publicFetch<T>(
  path: string,
  schema: ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, { ...init, headers: baseHeaders(init) });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok) throw ApiError.fromResponse(res.status, json);
  return schema.parse(unwrap(json));
}

/**
 * 인증 필요 — 우리 `/api/**` 호출 + Authorization 헤더 자동 첨부(메모리 보관 Access Token,
 * `useAuthTokenStore`/`authTokenRef.ts`, FE-05). 401 이면 `/api/auth/refresh` 를 1회 시도 →
 * 성공 시 원 요청 재시도, 실패 시 세션 정리 후 로그인 유도.
 */
export async function privateFetch<T>(
  path: string,
  schema: ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const doFetch = () => {
    const token = getAccessToken();
    return fetch(path, {
      ...init,
      headers: {
        ...baseHeaders(init),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  };

  let res = await doFetch();

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (!refreshed) {
      clearAccessToken();
      throw new ApiError(401, '로그인이 만료되었습니다. 다시 로그인해주세요.');
    }
    res = await doFetch();
  }

  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok) throw ApiError.fromResponse(res.status, json);
  return schema.parse(unwrap(json));
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/refresh', { method: 'POST' });
    if (!res.ok) return false;
    const json = (await res.json()) as ApiEnvelope<{ accessToken: string }>;
    setAccessToken(json.data.accessToken);
    return true;
  } catch {
    return false;
  }
}
