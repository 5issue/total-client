import { fail, ok } from '@/lib/apiResponse';
import { env } from '@/lib/env';
import { fetchSpringData } from '@/lib/springApi';
import { mapSpringCategories, SpringCategoryTreeDataSchema } from '@/types/product';

/**
 * 필터 바텀시트 "카테고리" 탭용 최상위 카테고리 목록 조회 — `useProductCategories`가 호출.
 * 인증 불필요. `GET /api/v1/products/categories`(백엔드 레포
 * `services/product-service/.../CategoryController.java` 확인, #128)는 파라미터가 없고
 * 검색어와 무관한 전체 카테고리 트리를 그대로 내려준다.
 */
const UPSTREAM_FAILURE_MESSAGE = '카테고리 정보를 불러오지 못했습니다.';

export async function GET() {
  const springUrl = new URL(`${env.API_INTERNAL_URL}/api/v1/products/categories`);

  let data;
  try {
    data = await fetchSpringData(springUrl, SpringCategoryTreeDataSchema);
  } catch {
    // route.ts(`/api/products`, `/api/products/filters`)와 동일한 이유(springApi.ts, #99 리뷰).
    return fail(502, UPSTREAM_FAILURE_MESSAGE);
  }

  return ok(mapSpringCategories(data));
}
