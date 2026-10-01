import type { NextRequest } from 'next/server';

import { fetchAiService, resolveUserId } from '@/lib/aiService';
import { fail } from '@/lib/apiResponse';
import { RecentRecipeIdParamSchema, RecentRecipeSummarySchema } from '@/types/recipe';

const UPSTREAM_FAILURE_MESSAGE = '레시피 조회를 기록하지 못했습니다.';

/** 레시피 조회 기록 — `useRecordRecentRecipe` 가 호출. AI 파트 RECENT-02(구현됨, 이슈 #153).
 *  재조회는 새 행 대신 viewed_at만 갱신(멱등), 없는 레시피는 404. DELETE는 스펙에 없다. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> },
) {
  const parsed = RecentRecipeIdParamSchema.safeParse((await params).recipeId);
  if (!parsed.success) {
    return fail(400, '레시피 정보가 올바르지 않습니다.');
  }

  const userId = await resolveUserId(req);
  if (userId === null) {
    return fail(401, '로그인이 필요합니다.');
  }

  return fetchAiService(
    `/api/v1/users/me/recent-recipes/${encodeURIComponent(parsed.data)}`,
    RecentRecipeSummarySchema,
    { method: 'POST', userId, failureMessage: UPSTREAM_FAILURE_MESSAGE },
  );
}
