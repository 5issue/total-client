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
/** upstream 실패는 원인을 가리지 않고 같은 메시지로 내린다 — 구현 세부 노출 방지. */
const UPSTREAM_FAILURE_MESSAGE = '상품 정보를 불러오지 못했습니다.';

export async function GET(req: NextRequest) {
  const parsed = ProductListParamsSchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));

  if (!parsed.success) {
    return fail(400, '검색어가 올바르지 않습니다.');
  }

  const { query, sort } = parsed.data;
  const springUrl = new URL(`${env.API_INTERNAL_URL}/api/v1/products`);
  springUrl.searchParams.set('query', query);
  springUrl.searchParams.set('sort', sort);

  let raw;
  try {
    const springRes = await fetch(springUrl, { headers: { 'Content-Type': 'application/json' } });
    raw = SpringEnvelopeSchema(SpringProductListDataSchema).parse(await springRes.json());
  } catch {
    // 연결 실패·비 JSON 응답·스키마 불일치가 전부 여기로 온다. 그대로 두면 Next 의
    // 프레임워크 오류 응답(봉투 없는 500)이 나가 `publicFetch` 가 `ApiEnvelope` 를
    // 못 받고, 화면은 에러 대신 로딩에 머문다(#99 리뷰).
    return fail(502, UPSTREAM_FAILURE_MESSAGE);
  }

  // 상태 코드와 메시지를 upstream 그대로 흘리지 않는다 — Spring 은 HTTP 200 + ERROR 봉투도
  // 보낼 수 있어 브라우저가 성공으로 오해하고, `raw.message` 엔 구현 세부가 섞일 수 있다
  // (security-convention FE-16).
  if (raw.status === 'ERROR' || !raw.data) {
    return fail(502, UPSTREAM_FAILURE_MESSAGE);
  }

  return ok(raw.data);
}
