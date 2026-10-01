'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { recipeKeys } from '@/hooks/recipe/queryKeys';
import { addFavoriteRecipe } from '@/lib/apiClient';

/** 레시피 찜 추가. 성공 후 찜 목록을 무효화한다(api-convention §7 — 기본 invalidate). */
export function useAddFavoriteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addFavoriteRecipe,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recipeKeys.favorites() }),
  });
}
