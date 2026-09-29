import { type NextRequest } from 'next/server';

import { fail, ok } from '@/lib/apiResponse';
import { env } from '@/lib/env';
import { fetchSpringData } from '@/lib/springApi';
import {
  mapSpringProductListResponse,
  ProductListParamsSchema,
  SPRING_SORT_MAP,
  SpringProductListDataSchema,
} from '@/types/product';

/**
 * 검색 결과 상품 목록 조회 — `useProducts` 가 호출. 인증 불필요(`publicFetch`).
 * 요청/응답 계약은 백엔드 레포(`5issue/total-backend`,
 * `services/product-service/api-spec/{routes/client/products.api.tsp,models/products.dto.tsp}`)
 * 로 확인함(#128) — 배포 Swagger(dev.cloudyim.store)는 여전히 다운 상태라 TypeSpec 소스를
 * 대신 읽었다. 로컬 백엔드가 뜨기 전까지는 `mocks/handlers/product.ts` 가 이 fetch 를 계속
 * 가로챈다(`API_MOCKING=enabled`일 때만) — 로컬 백엔드 확인되면 그 mock 을 끄고 아래 매핑이
 * 맞는지(특히 `SliceResponse` 모양은 백엔드도 "미검증"이라고 명시함) 실응답으로 재검증할 것.
 *
 * 알려진 갭(#128, 디자인/백엔드 협의 필요): `ProductSummaryResponse`엔 리뷰 수·쿠폰 뱃지·
 * 배송 타입·Kurly Only·멤버스 여부가 없다 — `mapSpringProductListResponse`가 안전한 기본값을
 * 채우는 중이라, 실제 서버 데이터로 붙이면 검색 결과 카드에서 이 정보들이 당장은 안 보인다.
 */
/** upstream 실패는 원인을 가리지 않고 같은 메시지로 내린다 — 구현 세부 노출 방지. */
const UPSTREAM_FAILURE_MESSAGE = '상품 정보를 불러오지 못했습니다.';

export async function GET(req: NextRequest) {
  const parsed = ProductListParamsSchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));

  if (!parsed.success) {
    return fail(400, '검색어가 올바르지 않습니다.');
  }

  const { query, sort, brand, price, storageType, categoryId } = parsed.data;
  const springUrl = new URL(`${env.API_INTERNAL_URL}/api/v1/products`);
  // Spring 쪽 파라미터명은 keyword(우리 query 아님) + 대문자 ProductSortType(#128).
  springUrl.searchParams.set('keyword', query);
  springUrl.searchParams.set('sort', SPRING_SORT_MAP[sort]);
  // brand/storageType은 Zod enum(#128)으로 이미 검증된 값만 여기 도달한다.
  if (brand) springUrl.searchParams.set('brand', brand);
  if (price) springUrl.searchParams.set('price', price);
  if (storageType) springUrl.searchParams.set('storageType', storageType);
  // categoryId는 keyword와 함께 보내도 된다 — `getProducts`는 "최소 하나"만 요구한다.
  // `/filters`(정확히 하나만 허용)와 다르니 그쪽 route.ts엔 이 파라미터를 넣지 않는다(#128).
  if (categoryId) springUrl.searchParams.set('categoryId', categoryId);

  let data;
  try {
    data = await fetchSpringData(springUrl, SpringProductListDataSchema);
  } catch {
    // 연결 실패·비 JSON 응답·스키마 불일치·Spring ERROR 봉투가 전부 여기로 온다(springApi.ts).
    // 상태 코드와 메시지를 upstream 그대로 흘리지 않는 이유: Spring 은 HTTP 200 + ERROR
    // 봉투도 보낼 수 있어 브라우저가 성공으로 오해하고, 메시지엔 구현 세부가 섞일 수 있다
    // (security-convention FE-16). 봉투 없는 500이 그대로 나가면 `publicFetch` 가
    // `ApiEnvelope` 를 못 받아 화면이 에러 대신 로딩에 머무는 것도 막는다(#99 리뷰).
    return fail(502, UPSTREAM_FAILURE_MESSAGE);
  }

  return ok(mapSpringProductListResponse(data));
}
