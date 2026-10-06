import type { NextRequest } from 'next/server';

import { fetchAiService, resolveUserId } from '@/lib/aiService';
import { fail } from '@/lib/apiResponse';
import {
  RecentRecipeDeleteRequestSchema,
  RecentRecipeDeleteResponseSchema,
  RecentRecipeListParamsSchema,
  RecentRecipeListResponseSchema,
} from '@/types/recipe';

const UPSTREAM_FAILURE_MESSAGE = '최근 본 레시피를 불러오지 못했습니다.';
const DELETE_FAILURE_MESSAGE = '최근 본 레시피를 삭제하지 못했습니다.';

/** 최근 본 레시피 목록 — `useRecentRecipes` 가 호출. AI 파트 RECENT-01(구현됨, 이슈 #153). */
export async function GET(req: NextRequest) {
  const { userId, authorization } = await resolveUserId(req);
  if (userId === null) {
    return fail(401, '로그인이 필요합니다.');
  }

  const searchParams = req.nextUrl.searchParams;
  const parsed = RecentRecipeListParamsSchema.safeParse({
    limit: searchParams.has('limit') ? Number(searchParams.get('limit')) : undefined,
  });
  if (!parsed.success) {
    return fail(400, '요청이 올바르지 않습니다.');
  }

  return fetchAiService(
    `/api/v1/users/me/recent-recipes?limit=${parsed.data.limit}`,
    RecentRecipeListResponseSchema,
    { method: 'GET', userId, authorization, failureMessage: UPSTREAM_FAILURE_MESSAGE },
  );
}

/** 최근 본 레시피 선택 삭제 — `useDeleteRecentRecipes`가 호출. AI 파트 RECENT-03(리뷰중, 이슈 #177).
 *  기록에 없는 id는 404가 아니라 조용히 스킵되므로(서버 계약), 여기선 그대로 통과시킨다. */
export async function DELETE(req: NextRequest) {
  const { userId, authorization } = await resolveUserId(req);
  if (userId === null) {
    return fail(401, '로그인이 필요합니다.');
  }

  const parsed = RecentRecipeDeleteRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return fail(400, '요청이 올바르지 않습니다.');
  }

  return fetchAiService('/api/v1/users/me/recent-recipes', RecentRecipeDeleteResponseSchema, {
    method: 'DELETE',
    userId,
    authorization,
    body: JSON.stringify(parsed.data),
    failureMessage: DELETE_FAILURE_MESSAGE,
  });
}
