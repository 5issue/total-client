import { HttpResponse, http } from 'msw';

/**
 * 로컬 백엔드가 아직 안 떠 있어 상품 검색 응답을 목킹한다(auth.ts 와 동일 패턴).
 * `API_INTERNAL_URL` 기준으로 매칭 — 우리 Route Handler(`/api/products`)가 서버사이드로
 * 호출하는 요청을 가로챈다(api-convention §3). 쿼리별 매칭 로직 없이 고정 목록 하나를
 * 반환한다 — Figma 목업(node 882-60568, 검색어 "우유")도 동일하게 고정 예시라 맞춘다.
 *
 * 응답 모양은 실제 Spring `ProductSummaryResponse`/`SliceResponse<T>`(백엔드 레포
 * `services/product-service/api-spec/models/products.dto.tsp` 기준, #128)를 그대로
 * 따른다 — `route.ts`의 `mapSpringProductListResponse`가 이걸 우리 UI 모델로 변환한다.
 */
const BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

/**
 * 목데이터 썸네일. 상품 이미지 API 가 없는 구간이라 중립 플레이스홀더 한 장을 쓴다 —
 * "이미지 미연동" 상태가 한눈에 보이고 외부 호스트 의존도 없다. 실제 CDN 이 붙으면 이
 * 상수만 응답값으로 교체한다.
 */
const PLACEHOLDER_THUMBNAIL = '/placeholders/product-thumbnail.webp';

function nowIso() {
  return new Date().toISOString();
}

type SpringMockProduct = {
  id: number;
  name: string;
  brand: string;
  price: number;
  salePrice: number;
  discountRate: number;
  likeCount: number;
  thumbnailUrl: string;
};

/** Figma node 882-60569 상품 그리드 8개를 Spring `ProductSummaryResponse` 모양으로 목데이터화(#128). */
const MOCK_PRODUCTS: SpringMockProduct[] = [
  {
    id: 1,
    name: '전용목장우유 900mL',
    brand: '연세우유 x 마켓컬리',
    price: 3400,
    salePrice: 2780,
    discountRate: 25,
    likeCount: 9999,
    thumbnailUrl: PLACEHOLDER_THUMBNAIL,
  },
  {
    id: 2,
    name: '전용목장우유 1.8L',
    brand: '연세우유 x 마켓컬리',
    price: 5280,
    salePrice: 4752,
    discountRate: 10,
    likeCount: 9999,
    thumbnailUrl: PLACEHOLDER_THUMBNAIL,
  },
  {
    id: 3,
    name: '나 100% 우유 1000mL',
    brand: '서울우유',
    price: 2980,
    salePrice: 2682,
    discountRate: 10,
    likeCount: 9999,
    thumbnailUrl: PLACEHOLDER_THUMBNAIL,
  },
  {
    id: 4,
    name: '제주 목초 우유 무항생제 750mL',
    brand: '제주우유',
    price: 3280,
    salePrice: 2952,
    discountRate: 10,
    likeCount: 9999,
    thumbnailUrl: PLACEHOLDER_THUMBNAIL,
  },
  {
    id: 5,
    name: '저지우유 750mL',
    brand: '제주우유',
    price: 4990,
    salePrice: 4491,
    discountRate: 10,
    likeCount: 9999,
    thumbnailUrl: PLACEHOLDER_THUMBNAIL,
  },
  {
    id: 6,
    name: '저지방 전용목장 우유 900mL',
    brand: '연세우유 x 마켓컬리',
    price: 2980,
    salePrice: 2382,
    discountRate: 10,
    likeCount: 9999,
    thumbnailUrl: PLACEHOLDER_THUMBNAIL,
  },
  {
    id: 7,
    name: '나100% 우유 2.3L 2종 (택1)',
    brand: '서울우유',
    price: 7580,
    salePrice: 6822,
    discountRate: 10,
    likeCount: 9999,
    thumbnailUrl: PLACEHOLDER_THUMBNAIL,
  },
  {
    id: 8,
    name: '제주목장 무항생제 목초 우유 900mL',
    brand: '제주축산농협',
    price: 3900,
    salePrice: 3280,
    discountRate: 15,
    likeCount: 9999,
    thumbnailUrl: PLACEHOLDER_THUMBNAIL,
  },
];

export const productHandlers = [
  // GET /api/v1/products — 검색 결과 상품 목록 (Spring SliceResponse 모양, #128)
  http.get(`${BASE}/api/v1/products`, () => {
    return HttpResponse.json({
      status: 'SUCCESS',
      message: '상품 목록',
      data: {
        content: MOCK_PRODUCTS,
        last: true,
        first: true,
        size: MOCK_PRODUCTS.length,
        number: 0,
        numberOfElements: MOCK_PRODUCTS.length,
        empty: false,
      },
      error: null,
      timestamp: nowIso(),
    });
  }),
];
