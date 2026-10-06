import type { NextRequest, NextResponse } from 'next/server';

const REFRESH_TOKEN_COOKIE = 'refresh_token';

/**
 * 우리 자신의 `refresh_token` 쿠키를 발급한다. `HttpOnly + Secure + SameSite=Strict`,
 * `Path=/` — Spring 원본의 `Path=/v1/auth/refresh` 를 그대로 쓰지 않는 이유는 `springCookie.ts` 참고.
 * (security FE-05)
 */
export function setRefreshTokenCookie(res: NextResponse, token: string, maxAgeSeconds: number) {
  res.cookies.set(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: maxAgeSeconds,
  });
}

export function clearRefreshTokenCookie(res: NextResponse) {
  res.cookies.delete(REFRESH_TOKEN_COOKIE);
}

export function getRefreshTokenCookie(req: NextRequest): string | undefined {
  return req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
}
