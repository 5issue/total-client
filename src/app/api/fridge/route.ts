import type { NextRequest } from 'next/server';

import { fetchAiService, resolveUserId } from '@/lib/aiService';
import { fail } from '@/lib/apiResponse';
import { FridgeListResponseSchema } from '@/types/fridge';

const UPSTREAM_FAILURE_MESSAGE = 'My냉장고 품목을 불러오지 못했습니다.';

/** My냉장고 품목 목록 — `useFridgeItems` 가 호출. AI 파트 FRIDGE-01(리뷰중, 이슈 #138). */
export async function GET(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (userId === null) {
    return fail(401, '로그인이 필요합니다.');
  }

  return fetchAiService('/api/v1/users/me/fridge', FridgeListResponseSchema, {
    method: 'GET',
    userId,
    failureMessage: UPSTREAM_FAILURE_MESSAGE,
  });
}
