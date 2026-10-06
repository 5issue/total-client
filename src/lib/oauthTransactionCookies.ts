import type { NextRequest, NextResponse } from 'next/server';

/**
 * 소셜 로그인 인가 요청 컨텍스트(`state`·`code_verifier`·`redirect_uri`)를 담아두는 임시 쿠키.
 *
 * Spring 은 브라우저와 직접 통신하지 않으므로(api-convention §3), 로그인 URL 발급
 * (`/api/auth/oauth/[provider]`) 때 Spring 이 Set-Cookie 로 내려준 값을 우리 자신의 쿠키로
 * 재발급해 브라우저에 심어두고, 콜백(`/callback/[provider]`)에서 다시 읽어 Spring 콜백
 * 호출에 `Cookie` 헤더로 그대로 실어 보낸다 — 인가 코드 가로채기 방지 검증에 Spring 쪽이 필요로
 * 하는 값이다(BE-16). 10분 짧은 수명, 콜백 처리 후 즉시 만료시킨다(Spring 과 동일 정책).
 */
const STATE_COOKIE = 'oauth_state';
const VERIFIER_COOKIE = 'oauth_code_verifier';
const REDIRECT_URI_COOKIE = 'oauth_redirect_uri';
const MAX_AGE_SECONDS = 600;

export interface OAuthTransaction {
  state: string;
  codeVerifier: string;
  redirectUri: string;
}

export function setOAuthTransactionCookies(res: NextResponse, transaction: OAuthTransaction) {
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  };
  res.cookies.set(STATE_COOKIE, transaction.state, options);
  res.cookies.set(VERIFIER_COOKIE, transaction.codeVerifier, options);
  res.cookies.set(REDIRECT_URI_COOKIE, transaction.redirectUri, options);
}

export function clearOAuthTransactionCookies(res: NextResponse) {
  res.cookies.delete(STATE_COOKIE);
  res.cookies.delete(VERIFIER_COOKIE);
  res.cookies.delete(REDIRECT_URI_COOKIE);
}

/** 콜백에서 Spring 호출용 `Cookie` 헤더 문자열을 만든다. 하나라도 없으면(만료 등) `null`. */
export function buildOAuthTransactionCookieHeader(req: NextRequest): string | null {
  const state = req.cookies.get(STATE_COOKIE)?.value;
  const codeVerifier = req.cookies.get(VERIFIER_COOKIE)?.value;
  const redirectUri = req.cookies.get(REDIRECT_URI_COOKIE)?.value;
  if (!state || !codeVerifier || !redirectUri) return null;

  return `${STATE_COOKIE}=${state}; ${VERIFIER_COOKIE}=${codeVerifier}; ${REDIRECT_URI_COOKIE}=${redirectUri}`;
}
