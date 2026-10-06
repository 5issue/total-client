'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { recipeKeys } from '@/hooks/recipe/queryKeys';
import { recordRecentRecipe } from '@/lib/apiClient';

/**
 * 레시피 조회 기록. 상세 화면 진입 시 호출하는 부수효과성 뮤테이션이라 에러를
 * 화면에 노출하지 않는다(비로그인이면 401, 조용히 무시). 성공 시 최근 본 목록을
 * 무효화한다(api-convention §7 — 기본 invalidate).
 */
export function useRecordRecentRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordRecentRecipe,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recipeKeys.recents() }),
  });
}
