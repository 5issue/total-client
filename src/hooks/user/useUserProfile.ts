'use client';

import { useQuery } from '@tanstack/react-query';

import { userKeys } from '@/hooks/user/queryKeys';
import { fetchUserProfile } from '@/lib/apiClient';

/** 마이컬리 홈 인사말(닉네임)에 쓰는 회원 프로필 조회. `PromoSummarySectionContainer`가 쓴다. */
export function useUserProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: fetchUserProfile,
  });
}
