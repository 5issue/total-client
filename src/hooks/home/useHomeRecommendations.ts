'use client';

import { useQuery } from '@tanstack/react-query';

import { homeKeys } from '@/hooks/home/queryKeys';
import { fetchHomeRecommendations } from '@/lib/apiClient';

/**
 * 홈 화면 퀵메뉴 + 진열 섹션 조회 (api-convention §1·§4). `HomeProductSections`가
 * 유일한 소비처다 — 퀵메뉴(`QuickMenuSection`)와 진열 섹션이 같은 응답의 다른 조각을
 * 쓰지만, 훅 구독과 로딩/에러 소유는 컨테이너 하나가 맡는다는 원칙(`ProductGrid`,
 * #90 리뷰 반영)에 따라 이 훅은 `HomeProductSections`에서만 호출하고 `QuickMenuSection`엔
 * props로 내려준다.
 */
export function useHomeRecommendations() {
  return useQuery({
    queryKey: homeKeys.recommendations(),
    queryFn: fetchHomeRecommendations,
  });
}
