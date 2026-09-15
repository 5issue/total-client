import { type NextRequest } from 'next/server';

import { fail, ok } from '@/lib/apiResponse';
import { env } from '@/lib/env';
import { SpringEnvelopeSchema } from '@/types/auth';
import { ProductListParamsSchema, SpringProductListDataSchema } from '@/types/product';

/**
 * 검색 결과 상품 목록 조회 — `useProducts` 가 호출. 인증 불필요(`publicFetch`).
 * Spring 백엔드 명세가 아직 없어 `mocks/handlers/product.ts` 가 이 fetch 를 가로챈다
 * (로컬에서 `API_MOCKING=enabled` 일 때만). 실제 명세가 나오면 이 파일의 fetch URL/쿼리
 * 매핑과 `types/product.ts` 의 필드만 맞추면 되고, 상위 레이어(apiClient·hooks·컴포넌트)는
 * 변경이 필요 없다.
 */
export async function GET(req: NextRequest) {
  const parsed = ProductListParamsSchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));

  if (!parsed.success) {
    return fail(400, '검색어가 올바르지 않습니다.');
  }

  const { query, sort } = parsed.data;
  const springUrl = new URL(`${env.API_INTERNAL_URL}/api/v1/products`);
  springUrl.searchParams.set('query', query);
  springUrl.searchParams.set('sort', sort);

  const springRes = await fetch(springUrl, { headers: { 'Content-Type': 'application/json' } });
  const raw = SpringEnvelopeSchema(SpringProductListDataSchema).parse(await springRes.json());

  if (raw.status === 'ERROR' || !raw.data) {
    return fail(springRes.status, raw.message);
  }

  return ok(raw.data);
}
