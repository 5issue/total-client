import { type NextRequest } from 'next/server';

import { fail, ok } from '@/lib/apiResponse';
import { env } from '@/lib/env';
import { fetchSpringData } from '@/lib/springApi';
import { SpringProductsByAiDataSchema } from '@/types/product';

/**
 * AI product_id → BE 상품 매핑 조회 — 이슈 #203. My냉장고 재구매·레시피 부족재료 담기가
 * AI 응답의 `product_id`를 BE 상품 PK로 오인해 엉뚱한 상품을 조회·장바구니에 담던 문제의
 * 수정 지점. 인증 불필요(Spring `@PublicApi`).
 *
 * 우리 쪽 쿼리 파라미터는 `aiProductIds`(쉼표 구분) — Spring 쪽 실제 파라미터명
 * `ai_product_ids`로 변환해서 보낸다.
 */
const UPSTREAM_FAILURE_MESSAGE = '상품 정보를 불러오지 못했습니다.';

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('aiProductIds');
  const aiProductIds =
    raw
      ?.split(',')
      .map((id) => id.trim())
      .filter(Boolean) ?? [];

  // 숫자가 아닌 값이 섞이면 Spring이 400 대신 파싱 오류로 터져 기존 catch에서 502로
  // 뭉뚱그려진다 — 여기서 먼저 걸러 호출자에게 정확한 원인을 돌려준다(코드래빗 리뷰).
  if (aiProductIds.length === 0 || !aiProductIds.every((id) => /^\d+$/.test(id))) {
    return fail(400, 'AI 상품 ID가 올바르지 않습니다.');
  }

  const springUrl = new URL(`${env.API_INTERNAL_URL}/api/v1/products/by-ai`);
  springUrl.searchParams.set('ai_product_ids', aiProductIds.join(','));

  let data;
  try {
    data = await fetchSpringData(springUrl, SpringProductsByAiDataSchema);
  } catch {
    return fail(502, UPSTREAM_FAILURE_MESSAGE);
  }

  return ok(data);
}
