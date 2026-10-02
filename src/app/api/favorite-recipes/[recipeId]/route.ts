import type { NextRequest } from 'next/server';

import { fetchAiService, resolveUserId } from '@/lib/aiService';
import { fail } from '@/lib/apiResponse';
import {
  FavoriteRecipeDeleteResponseSchema,
  FavoriteRecipeIdParamSchema,
  FavoriteRecipeSummarySchema,
} from '@/types/recipe';

const ADD_FAILURE_MESSAGE = '레시피를 찜하지 못했습니다.';
const REMOVE_FAILURE_MESSAGE = '찜을 취소하지 못했습니다.';

/** 레시피 찜 추가 — `useAddFavoriteRecipe` 가 호출. AI 파트 FAV-02(구현됨, 이슈 #152).
 *  없는 레시피 404, 이미 찜한 레시피 409 — 둘 다 upstream message 그대로 전달(FE-16). */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> },
) {
  const parsed = FavoriteRecipeIdParamSchema.safeParse((await params).recipeId);
  if (!parsed.success) {
    return fail(400, '레시피 정보가 올바르지 않습니다.');
  }

  const { userId, authorization } = await resolveUserId(req);
  if (userId === null) {
    return fail(401, '로그인이 필요합니다.');
  }

  return fetchAiService(
    `/api/v1/users/me/favorite-recipes/${encodeURIComponent(parsed.data)}`,
    FavoriteRecipeSummarySchema,
    { method: 'POST', userId, authorization, failureMessage: ADD_FAILURE_MESSAGE },
  );
}

/** 레시피 찜 취소 — `useRemoveFavoriteRecipe` 가 호출. AI 파트 FAV-03(구현됨, 이슈 #152).
 *  냉장고 DELETE 와 같이 HTTP 200 + envelope(data null). 찜하지 않은 레시피는 404. */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> },
) {
  const parsed = FavoriteRecipeIdParamSchema.safeParse((await params).recipeId);
  if (!parsed.success) {
    return fail(400, '레시피 정보가 올바르지 않습니다.');
  }

  const { userId, authorization } = await resolveUserId(req);
  if (userId === null) {
    return fail(401, '로그인이 필요합니다.');
  }

  return fetchAiService(
    `/api/v1/users/me/favorite-recipes/${encodeURIComponent(parsed.data)}`,
    FavoriteRecipeDeleteResponseSchema,
    { method: 'DELETE', userId, authorization, failureMessage: REMOVE_FAILURE_MESSAGE },
  );
}
