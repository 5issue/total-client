import type { NextRequest } from 'next/server';

import { fetchAiService } from '@/lib/aiService';
import { fail } from '@/lib/apiResponse';
import { StorageGuideResponseSchema } from '@/types/storageGuide';

const UPSTREAM_FAILURE_MESSAGE = '보관 가이드를 불러오지 못했습니다.';

/**
 * 상품 보관 가이드 — `useStorageGuide` 가 호출. AI 파트 PROD-03(개발완료, 이슈 #142).
 * `products` 라우터 전체가 비로그인 허용이라 `X-User-Id` 를 보내지 않는다.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;
  if (!productId) {
    return fail(400, '상품 정보가 올바르지 않습니다.');
  }

  return fetchAiService(
    `/api/v1/products/${encodeURIComponent(productId)}/storage-guide`,
    StorageGuideResponseSchema,
    { method: 'GET', failureMessage: UPSTREAM_FAILURE_MESSAGE },
  );
}
