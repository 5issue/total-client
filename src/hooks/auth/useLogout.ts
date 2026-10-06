'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { logout } from '@/lib/apiClient';

/**
 * 로그아웃(마이컬리 홈 "계정" 섹션, #148). `apiClient.logout` 이 서버 호출 성공 여부와
 * 무관하게 로컬 accessToken 을 항상 지우므로(finally), 이 훅도 성공/실패를 구분하지
 * 않고 `onSettled` 에서 캐시를 비우고 로그인 화면으로 보낸다 — 이전 사용자의 사적
 * 데이터(장바구니·주문·프로필 등)가 다음 화면에 남아있지 않도록 전체 캐시를 지운다.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.clear();
      router.replace('/login');
    },
  });
}
