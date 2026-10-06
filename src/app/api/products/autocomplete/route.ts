import { type NextRequest } from 'next/server';

import { fail, ok } from '@/lib/apiResponse';
import { env } from '@/lib/env';
import { fetchSpringData } from '@/lib/springApi';
import {
  ProductAutocompleteParamsSchema,
  SpringProductAutocompleteDataSchema,
} from '@/types/product';

/**
 * 검색창 자동완성 — `useProductAutocomplete`가 호출. 인증 불필요. `GET /api/v1/products/autocomplete`
 * (백엔드 레포 `services/product-service/.../ProductController.java` 확인)는 `keyword`
 * 필수·`size`(생략 시 10) — `size`는 우리 쪽에서 안 받으므로 넘기지 않는다.
 */
const UPSTREAM_FAILURE_MESSAGE = '자동완성 결과를 불러오지 못했습니다.';

export async function GET(req: NextRequest) {
  const parsed = ProductAutocompleteParamsSchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams),
  );

  if (!parsed.success) {
    return fail(400, '검색어가 올바르지 않습니다.');
  }

  const springUrl = new URL(`${env.API_INTERNAL_URL}/api/v1/products/autocomplete`);
  springUrl.searchParams.set('keyword', parsed.data.keyword);

  let data;
  try {
    data = await fetchSpringData(springUrl, SpringProductAutocompleteDataSchema);
  } catch {
    // 다른 products/* route.ts와 동일한 이유(springApi.ts, #99 리뷰).
    return fail(502, UPSTREAM_FAILURE_MESSAGE);
  }

  return ok(data);
}
