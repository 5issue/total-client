import { type NextRequest } from 'next/server';
import { z } from 'zod';

import { fail, ok } from '@/lib/apiResponse';
import { env } from '@/lib/env';
import { SpringEnvelopeSchema } from '@/types/auth';
import { mapSpringProductFilters, SpringProductFilterDataSchema } from '@/types/product';

/**
 * 검색 결과 화면의 필터 바텀시트(브랜드/가격/유형 탭)가 쓸 필터 옵션 조회 — `useProductFilters`
 * 가 호출. 인증 불필요. `GET /api/v1/products/filters`(백엔드 레포
 * `services/product-service/src/main/java/.../ProductController.java`,
 * `ProductFilterService.java` 확인, #128) 는 `categoryId` 또는 `keyword` 중 정확히 하나만
 * 받는다 — 우리는 검색 흐름이라 항상 `keyword`만 보낸다.
 */
const ParamsSchema = z.object({ keyword: z.string().min(1) });

/** upstream 실패는 원인을 가리지 않고 같은 메시지로 내린다 — 구현 세부 노출 방지. */
const UPSTREAM_FAILURE_MESSAGE = '필터 정보를 불러오지 못했습니다.';

export async function GET(req: NextRequest) {
  const parsed = ParamsSchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));

  if (!parsed.success) {
    return fail(400, '검색어가 올바르지 않습니다.');
  }

  const springUrl = new URL(`${env.API_INTERNAL_URL}/api/v1/products/filters`);
  springUrl.searchParams.set('keyword', parsed.data.keyword);

  let raw;
  try {
    const springRes = await fetch(springUrl, { headers: { 'Content-Type': 'application/json' } });
    raw = SpringEnvelopeSchema(SpringProductFilterDataSchema).parse(await springRes.json());
  } catch {
    // route.ts(`/api/products`)와 동일한 이유(#99 리뷰) — 봉투 없는 500이 나가면
    // publicFetch 가 ApiEnvelope 를 못 받아 화면이 로딩에 머문다.
    return fail(502, UPSTREAM_FAILURE_MESSAGE);
  }

  if (raw.status === 'ERROR' || !raw.data) {
    return fail(502, UPSTREAM_FAILURE_MESSAGE);
  }

  return ok(mapSpringProductFilters(raw.data));
}
