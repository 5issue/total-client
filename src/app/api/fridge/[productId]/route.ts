import type { NextRequest } from 'next/server';

import { fetchAiService, resolveUserId } from '@/lib/aiService';
import { fail } from '@/lib/apiResponse';
import { FridgeDeleteResponseSchema, FridgeProductIdParamSchema } from '@/types/fridge';

const UPSTREAM_FAILURE_MESSAGE = '품목을 삭제하지 못했습니다.';

/** My냉장고 품목 삭제 — 선택삭제 시 품목별로 호출된다. AI 파트 FRIDGE-04(리뷰중, 이슈 #138). */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const parsed = FridgeProductIdParamSchema.safeParse((await params).productId);
  if (!parsed.success) {
    return fail(400, '상품 정보가 올바르지 않습니다.');
  }

  const userId = await resolveUserId(req);
  if (userId === null) {
    return fail(401, '로그인이 필요합니다.');
  }

  return fetchAiService(
    `/api/v1/users/me/fridge/${encodeURIComponent(parsed.data)}`,
    FridgeDeleteResponseSchema,
    { method: 'DELETE', userId, failureMessage: UPSTREAM_FAILURE_MESSAGE },
  );
}
