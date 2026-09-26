import type { NextRequest } from 'next/server';

import { fetchAiService } from '@/lib/aiService';
import { fail } from '@/lib/apiResponse';
import { RecipeDetailSchema } from '@/types/recipe';

const UPSTREAM_FAILURE_MESSAGE = '레시피 정보를 불러오지 못했습니다.';

/**
 * 레시피 상세 — `useRecipeDetail` 이 호출. AI 파트 RECIPE-01(개발완료, 이슈 #140).
 * 레시피 콘텐츠 자체는 사용자별로 달라지지 않아 비로그인도 허용한다 — `X-User-Id`
 * 를 보내지 않는다(fridge류 엔드포인트와의 차이, lib/aiService.ts 참고).
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ recipeId: string }> }) {
  const { recipeId } = await params;
  if (!recipeId) {
    return fail(400, '레시피 정보가 올바르지 않습니다.');
  }

  return fetchAiService(`/api/v1/recipes/${encodeURIComponent(recipeId)}`, RecipeDetailSchema, {
    method: 'GET',
    failureMessage: UPSTREAM_FAILURE_MESSAGE,
  });
}
