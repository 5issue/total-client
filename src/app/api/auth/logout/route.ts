import { type NextRequest } from 'next/server';

import { fail, ok } from '@/lib/apiResponse';
import { clearRefreshTokenCookie } from '@/lib/authCookies';
import { env } from '@/lib/env';
import { SpringEnvelopeSchema, SpringLogoutDataSchema } from '@/types/auth';

/**
 * 로그아웃(#148). `privateFetch` 가 Authorization 헤더를 실어 보내면 Spring 이 그 access
 * token 으로 사용자를 식별해 refresh token 세션을 제거한다(쿠키는 Spring 요청에 실리지
 * 않는다 — `AuthController.logout` 참고).
 *
 * Spring 호출이 실패(네트워크 오류·만료된 access token 등)해도 우리 `refresh_token`
 * 쿠키는 항상 지운다 — 로그아웃은 "브라우저 쪽 세션은 반드시 끝난다"가 보장돼야 하는
 * 동작이라, 서버 세션 정리 성공 여부와 로컬 쿠키 정리를 분리한다.
 */
export async function POST(req: NextRequest) {
  const authorization = req.headers.get('authorization');

  const res = await (async () => {
    if (!authorization) {
      return fail(401, '로그인이 필요합니다.');
    }
    try {
      const springRes = await fetch(`${env.API_INTERNAL_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: { Authorization: authorization },
      });
      const raw = SpringEnvelopeSchema(SpringLogoutDataSchema).parse(await springRes.json());
      if (raw.status === 'ERROR' || !raw.data) {
        return fail(springRes.status >= 400 ? springRes.status : 400, raw.message);
      }
      return ok(raw.data, raw.message);
    } catch {
      return fail(502, '로그아웃 처리 중 오류가 발생했습니다.');
    }
  })();

  clearRefreshTokenCookie(res);
  return res;
}
