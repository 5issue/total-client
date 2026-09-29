import type { NextRequest } from 'next/server';

import { fetchAiService, resolveUserId } from '@/lib/aiService';
import { fail } from '@/lib/apiResponse';
import { MissingProductsParamsSchema, MissingProductsResponseSchema } from '@/types/recipe';

const UPSTREAM_FAILURE_MESSAGE = '부족한 재료 상품을 불러오지 못했습니다.';

/**
 * 부족 재료 상품 추천 — `useMissingProducts` 가 호출. AI 파트 RECIPE-03(개발완료,
 * 이슈 #140). 로그인 없이도 호출 가능(명세 §04-2 "X-User-Id 선택 — 없으면 냉장고
 * 갈래 미사용") — 로그인 상태면 냉장고 보유분까지 반영해 더 정확해진다.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ recipeId: string }> }) {
  const { recipeId } = await params;
  if (!recipeId) {
    return fail(400, '레시피 정보가 올바르지 않습니다.');
  }

  const searchParams = req.nextUrl.searchParams;
  const parsed = MissingProductsParamsSchema.safeParse({
    baseProductId: searchParams.has('baseProductId')
      ? Number(searchParams.get('baseProductId'))
      : undefined,
    maxPerIngredient: searchParams.has('maxPerIngredient')
      ? Number(searchParams.get('maxPerIngredient'))
      : undefined,
  });
  if (!parsed.success) {
    return fail(400, '요청이 올바르지 않습니다.');
  }

  const userId = await resolveUserId(req);

  const query = new URLSearchParams({
    base_product_id: String(parsed.data.baseProductId),
    max_per_ingredient: String(parsed.data.maxPerIngredient),
  });

  return fetchAiService(
    `/api/v1/recipes/${encodeURIComponent(recipeId)}/missing-products?${query}`,
    MissingProductsResponseSchema,
    { method: 'GET', userId, failureMessage: UPSTREAM_FAILURE_MESSAGE },
  );
}
