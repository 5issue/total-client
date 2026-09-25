import type { NextRequest } from 'next/server';

import { fetchAiService, resolveUserId } from '@/lib/aiService';
import { fail } from '@/lib/apiResponse';
import {
  MyRecipeRecommendationParamsSchema,
  MyRecipeRecommendationsResponseSchema,
} from '@/types/recipe';

const UPSTREAM_FAILURE_MESSAGE = '추천 레시피를 불러오지 못했습니다.';

/**
 * My냉장고 기반 레시피 추천 — `useMyRecipeRecommendations` 가 호출.
 * AI 파트 RECO-02(개발완료, 이슈 #138). 데이터 계층만 — 화면 연결은 후속 이슈
 * (레시피 상세 RECIPE-01 필요, types/recipe.ts 주석 참고).
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const parsed = MyRecipeRecommendationParamsSchema.safeParse({
    minMatchRate: params.has('minMatchRate') ? Number(params.get('minMatchRate')) : undefined,
    limit: params.has('limit') ? Number(params.get('limit')) : undefined,
  });
  if (!parsed.success) {
    return fail(400, '요청이 올바르지 않습니다.');
  }

  const userId = await resolveUserId(req);
  if (userId === null) {
    return fail(401, '로그인이 필요합니다.');
  }

  const query = new URLSearchParams({
    min_match_rate: String(parsed.data.minMatchRate),
    limit: String(parsed.data.limit),
  });

  return fetchAiService(
    `/api/v1/recommendations/my-recipes?${query}`,
    MyRecipeRecommendationsResponseSchema,
    { method: 'GET', userId, failureMessage: UPSTREAM_FAILURE_MESSAGE },
  );
}
