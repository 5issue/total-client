'use client';

import { useMutation } from '@tanstack/react-query';

import { publicFetch } from '@/lib/apiClient';
import { SpringLoginUrlDataSchema, type OAuthProvider } from '@/types/auth';

/**
 * 카카오/네이버 로그인 시작. `/api/auth/oauth/[provider]` 에서 로그인 URL을 받아
 * 그 URL로 브라우저를 이동시킨다(전체 페이지 이동 — 제공자 동의화면은 우리 앱 밖).
 * 로그인 전 단계라 인증 불필요 → `publicFetch`.
 */
export function useOAuthLogin() {
  return useMutation({
    mutationFn: (provider: OAuthProvider) =>
      publicFetch(`/api/auth/oauth/${provider}`, SpringLoginUrlDataSchema, { method: 'POST' }),
    onSuccess: (data) => {
      window.location.href = data.loginUrl;
    },
  });
}
