import type { NextRequest } from 'next/server';

import { fetchAiService, resolveUserId } from '@/lib/aiService';
import { fail } from '@/lib/apiResponse';
import { FavoriteRecipeListParamsSchema, FavoriteRecipeListResponseSchema } from '@/types/recipe';

const UPSTREAM_FAILURE_MESSAGE = '찜한 레시피를 불러오지 못했습니다.';

/** 찜한 레시피 목록 — `useFavoriteRecipes` 가 호출. AI 파트 FAV-01(구현됨, 이슈 #152). */
export async function GET(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (userId === null) {
    return fail(401, '로그인이 필요합니다.');
  }

  const searchParams = req.nextUrl.searchParams;
  const parsed = FavoriteRecipeListParamsSchema.safeParse({
    limit: searchParams.has('limit') ? Number(searchParams.get('limit')) : undefined,
  });
  if (!parsed.success) {
    return fail(400, '요청이 올바르지 않습니다.');
  }

  return fetchAiService(
    `/api/v1/users/me/favorite-recipes?limit=${parsed.data.limit}`,
    FavoriteRecipeListResponseSchema,
    { method: 'GET', userId, failureMessage: UPSTREAM_FAILURE_MESSAGE },
  );
}
