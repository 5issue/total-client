import { type NextRequest } from 'next/server';

import { fail, ok } from '@/lib/apiResponse';
import {
  clearRefreshTokenCookie,
  getRefreshTokenCookie,
  setRefreshTokenCookie,
} from '@/lib/authCookies';
import { env } from '@/lib/env';
import { extractRefreshTokenCookie } from '@/lib/springCookie';
import { SpringEnvelopeSchema, SpringRefreshDataSchema } from '@/types/auth';

/**
 * `privateFetch` 의 401 인터셉터가 호출. 우리 `refresh_token` 쿠키로 Spring 에서 새
 * accessToken 을 발급받고, 회전된 refresh_token 도 우리 쿠키로 재발급한다.
 */
export async function POST(req: NextRequest) {
  const refreshToken = getRefreshTokenCookie(req);
  if (!refreshToken) {
    return fail(401, '로그인이 필요합니다.');
  }

  const springRes = await fetch(`${env.API_INTERNAL_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `refresh_token=${refreshToken}`,
    },
    body: JSON.stringify({}),
  });

  const raw = SpringEnvelopeSchema(SpringRefreshDataSchema).parse(await springRes.json());

  if (raw.status === 'ERROR' || !raw.data) {
    const res = fail(401, raw.message);
    clearRefreshTokenCookie(res);
    return res;
  }

  const res = ok(raw.data);
  const rotated = extractRefreshTokenCookie(springRes.headers.getSetCookie());
  if (rotated) {
    setRefreshTokenCookie(res, rotated.value, rotated.maxAge);
  }
  return res;
}
