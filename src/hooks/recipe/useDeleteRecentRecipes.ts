'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { recipeKeys } from '@/hooks/recipe/queryKeys';
import { deleteRecentRecipes } from '@/lib/apiClient';

/** 최근 본 레시피 선택 삭제. 성공 후 목록을 무효화한다(api-convention §7 — 기본 invalidate). */
export function useDeleteRecentRecipes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRecentRecipes,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recipeKeys.recents() }),
  });
}
