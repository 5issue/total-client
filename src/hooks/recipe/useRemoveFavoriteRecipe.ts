'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { recipeKeys } from '@/hooks/recipe/queryKeys';
import { removeFavoriteRecipe } from '@/lib/apiClient';

/** 레시피 찜 취소. 성공 후 찜 목록을 무효화한다(api-convention §7 — 기본 invalidate). */
export function useRemoveFavoriteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFavoriteRecipe,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recipeKeys.favorites() }),
  });
}
