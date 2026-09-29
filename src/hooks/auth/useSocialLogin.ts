'use client';

import { useMutation } from '@tanstack/react-query';

import { requestSocialLoginUrl } from '@/lib/apiClient';
import type { OAuthProvider } from '@/types/auth';

/**
 * 카카오/네이버 로그인 시작. `/api/auth/oauth/[provider]` 에서 로그인 URL을 받아
 * 그 URL로 브라우저를 이동시킨다(전체 페이지 이동 — 제공자 동의화면은 우리 앱 밖).
 * 로그인 전 단계라 인증 불필요.
 *
 * `returnTo` — 로그인 완료 후 되돌아갈 페이지(선택, 이미 `safeRedirect` 로 검증된 값을
 * 호출측이 넘겨야 한다). 호출 시점에 고정되는 값이라 훅 인자로 받는다.
 */
export function useSocialLogin(returnTo?: string) {
  return useMutation({
    mutationFn: (provider: OAuthProvider) => requestSocialLoginUrl(provider, returnTo),
    onSuccess: (data) => {
      window.location.href = data.loginUrl;
    },
  });
}
