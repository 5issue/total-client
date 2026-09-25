import { HttpResponse, http } from 'msw';

/**
 * 로컬 백엔드가 아직 안 떠 있어 상품 검색/필터/카테고리 응답을 목킹한다(auth.ts 와 동일 패턴).
 * `API_INTERNAL_URL` 기준으로 매칭 — 우리 Route Handler(`/api/products`, `/api/products/filters`,
 * `/api/products/categories`)가 서버사이드로 호출하는 요청을 가로챈다(api-convention §3).
 * Figma 목업(node 882-60568, 검색어 "우유") 기준 고정 상품 8개 풀에서
 * `keyword`/`brand`/`price`/`storageType`/`categoryId`으로 걸러내고 `sort`로 정렬해서
 * 반환한다 — 로컬에서 검색/정렬/필터 UI가 실제로 동작하는 것처럼 보이게 하기 위함이다(#128).
 * 진짜 로직은 실제 백엔드가 하는 일이고, 이건 로컬 개발 편의를 위한 목업일 뿐이다.
 *
 * 응답 모양은 실제 Spring `ProductSummaryResponse`/`SliceResponse<T>`/`ProductFilterResponse`/
 * `CategoryResponse`(백엔드 레포 `services/product-service` 기준, #128)를 그대로 따른다 —
 * `route.ts`의 `mapSpringProductListResponse`/`mapSpringProductFilters`/`mapSpringCategories`가
 * 이걸 우리 UI 모델로 변환한다.
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

type StorageType = 'REFRIGERATED' | 'FROZEN' | 'ROOM_TEMPERATURE';

type SpringMockProduct = {
  id: number;
  name: string;
  brand: string;
  price: number;
  salePrice: number;
  discountRate: number;
  likeCount: number;
  thumbnailUrl: string;
  storageType: StorageType;
  categoryId: number;
};

/**
 * 최상위 STANDARD 카테고리 목업(#128). 실제 백엔드 시드(`5issue/total-backend`,
 * `seed_product_service.sql`)의 이름을 그대로 가져왔다 — id 값 자체는 로컬 목업 전용이라
 * 실제 백엔드 id와 일치할 필요는 없다. 8개 목업 상품이 전부 우유라 `유제품`에 묶는다.
 */
const MOCK_CATEGORIES = [
  { id: 1, name: '채소' },
  { id: 2, name: '과일·견과·쌀' },
  { id: 3, name: '수산·해산·건어물' },
  { id: 4, name: '정육·가공육·달걀' },
  { id: 12, name: '유제품' },
] as const;
const DAIRY_CATEGORY_ID = 12;

/**
 * Figma node 882-60569 상품 그리드 8개를 Spring `ProductSummaryResponse` 모양으로
 * 목데이터화(#128). `storageType`은 실제 백엔드 필드지만 목데이터엔 없던 값이라, 필터
 * 데모가 의미 있게 갈리도록 임의로 섞어 배정했다(실제 상품별 진짜 값 아님). 8개 전부
 * 우유라 `categoryId`는 개별 지정 대신 `유제품` 하나로 일괄 부여한다.
 */
const MOCK_PRODUCTS: SpringMockProduct[] = (
  [
    {
      id: 1,
      name: '전용목장우유 900mL',
      brand: '연세우유 x 마켓컬리',
      price: 3400,
      salePrice: 2780,
      discountRate: 25,
      likeCount: 5188,
      storageType: 'REFRIGERATED',
    },
    {
      id: 2,
      name: '전용목장우유 1.8L',
      brand: '연세우유 x 마켓컬리',
      price: 5280,
      salePrice: 4752,
      discountRate: 10,
      likeCount: 9999,
      storageType: 'REFRIGERATED',
    },
    {
      id: 3,
      name: '나 100% 우유 1000mL',
      brand: '서울우유',
      price: 2980,
      salePrice: 2682,
      discountRate: 10,
      likeCount: 4092,
      storageType: 'REFRIGERATED',
    },
    {
      id: 4,
      name: '제주 목초 우유 무항생제 750mL',
      brand: '제주우유',
      price: 3280,
      salePrice: 2952,
      discountRate: 10,
      likeCount: 7305,
      storageType: 'REFRIGERATED',
    },
    {
      id: 5,
      name: '저지우유 750mL',
      brand: '제주우유',
      price: 4990,
      salePrice: 4491,
      discountRate: 10,
      likeCount: 2144,
      storageType: 'REFRIGERATED',
    },
    {
      id: 6,
      name: '저지방 전용목장 우유 900mL',
      brand: '연세우유 x 마켓컬리',
      price: 2980,
      salePrice: 2382,
      discountRate: 10,
      likeCount: 8421,
      storageType: 'REFRIGERATED',
    },
    {
      id: 7,
      name: '나100% 우유 2.3L 2종 (택1)',
      brand: '서울우유',
      price: 7580,
      salePrice: 6822,
      discountRate: 10,
      likeCount: 6210,
      storageType: 'FROZEN',
    },
    {
      id: 8,
      name: '제주목장 무항생제 목초 우유 900mL',
      brand: '제주축산농협',
      price: 3900,
      salePrice: 3280,
      discountRate: 15,
      likeCount: 3057,
      storageType: 'ROOM_TEMPERATURE',
    },
  ] satisfies Omit<SpringMockProduct, 'thumbnailUrl' | 'categoryId'>[]
).map((p) => ({ ...p, thumbnailUrl: PLACEHOLDER_THUMBNAIL, categoryId: DAIRY_CATEGORY_ID }));

/** Spring `PriceBand` 5단계(`PriceBand.java` 기준) — 목업 필터 계산에도 그대로 쓴다(#128). */
const PRICE_BANDS = [
  { label: '5,000원 미만', value: '0-5000', min: 0, maxExclusive: 5_000 },
  { label: '5,000원 ~ 10,000원', value: '5000-10000', min: 5_000, maxExclusive: 10_000 },
  { label: '10,000원 ~ 20,000원', value: '10000-20000', min: 10_000, maxExclusive: 20_000 },
  { label: '20,000원 ~ 30,000원', value: '20000-30000', min: 20_000, maxExclusive: 30_000 },
  { label: '30,000원 이상', value: '30000-', min: 30_000, maxExclusive: Infinity },
] as const;

/** Spring `ProductSpec.StorageType` 라벨(`ProductSpec.java` 기준) — "상온"이 아니라 "실온"이다. */
const STORAGE_TYPE_LABELS: Record<StorageType, string> = {
  REFRIGERATED: '냉장',
  FROZEN: '냉동',
  ROOM_TEMPERATURE: '실온',
};

/** Spring `ProductSortType`(route.ts 의 `SPRING_SORT_MAP` 값)별 정렬 규칙 — 목업 전용. */
function sortMockProducts(products: SpringMockProduct[], sort: string): SpringMockProduct[] {
  const sorted = [...products];
  switch (sort) {
    case 'LATEST':
      return sorted.sort((a, b) => b.id - a.id);
    case 'POPULAR':
      return sorted.sort((a, b) => b.likeCount - a.likeCount);
    case 'BENEFIT':
      return sorted.sort((a, b) => b.discountRate - a.discountRate);
    case 'PRICE_ASC':
      return sorted.sort((a, b) => a.salePrice - b.salePrice);
    case 'PRICE_DESC':
      return sorted.sort((a, b) => b.salePrice - a.salePrice);
    case 'RECOMMENDED':
    default:
      return sorted.sort((a, b) => a.id - b.id);
  }
}

/** 이름/브랜드에 검색어가 포함되는지 — 목록/필터 두 핸들러가 동일하게 쓴다. */
function matchesKeyword(product: SpringMockProduct, keyword: string): boolean {
  return product.name.includes(keyword) || product.brand.includes(keyword);
}

/** `PriceBand.contains(price)`(백엔드) 흉내 — 목록 필터링과 필터 개수 집계 양쪽에서 쓴다. */
function matchesPriceBand(product: SpringMockProduct, band: (typeof PRICE_BANDS)[number]): boolean {
  return product.salePrice >= band.min && product.salePrice < band.maxExclusive;
}

/** `ProductFilterService.buildFilterResponse`와 같은 순서/조건(빈 그룹은 생략)으로 흉내. */
function buildMockFilters(products: SpringMockProduct[]) {
  const filterGroups: { filterId: string; title: string; items: unknown[] }[] = [];

  const brandCounts = new Map<string, number>();
  for (const p of products) brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);
  const brandItems = [...brandCounts.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'ko'))
    .map(([brand, count]) => ({ label: brand, value: brand, count }));
  if (brandItems.length > 0)
    filterGroups.push({ filterId: 'brand', title: '브랜드', items: brandItems });

  const priceItems = PRICE_BANDS.map((band) => ({
    label: band.label,
    value: band.value,
    count: products.filter((p) => matchesPriceBand(p, band)).length,
  })).filter((item) => item.count > 0);
  if (priceItems.length > 0)
    filterGroups.push({ filterId: 'price', title: '가격', items: priceItems });

  const storageCounts = new Map<StorageType, number>();
  for (const p of products)
    storageCounts.set(p.storageType, (storageCounts.get(p.storageType) ?? 0) + 1);
  const storageItems = [...storageCounts.entries()].map(([type, count]) => ({
    label: STORAGE_TYPE_LABELS[type],
    value: type,
    count,
  }));
  // 백엔드가 실제로 이 그룹에 "포장타입"이라는 잘못된 title을 붙인다(#128) — 목업도 그대로 재현.
  if (storageItems.length > 0) {
    filterGroups.push({ filterId: 'storageType', title: '포장타입', items: storageItems });
  }

  return { totalCount: products.length, filterGroups };
}

export const productHandlers = [
  // GET /api/v1/products — 검색 결과 상품 목록 (Spring SliceResponse 모양, #128)
  http.get(`${BASE}/api/v1/products`, ({ request }) => {
    const params = new URL(request.url).searchParams;
    const keyword = params.get('keyword')?.trim() ?? '';
    const sort = params.get('sort') ?? 'RECOMMENDED';
    const brand = params.get('brand');
    const price = params.get('price');
    const storageType = params.get('storageType');
    const categoryId = params.get('categoryId');
    const priceBand = PRICE_BANDS.find((b) => b.value === price);

    let matched = keyword ? MOCK_PRODUCTS.filter((p) => matchesKeyword(p, keyword)) : MOCK_PRODUCTS;
    if (brand) matched = matched.filter((p) => p.brand === brand);
    if (priceBand) matched = matched.filter((p) => matchesPriceBand(p, priceBand));
    if (storageType) matched = matched.filter((p) => p.storageType === storageType);
    // 실제 백엔드는 하위 카테고리까지 포함해 걸러주지만(`findAllSubCategoryIds`), 목업
    // 카테고리엔 하위 트리가 없어 단순 일치로 흉내낸다(#128).
    if (categoryId) matched = matched.filter((p) => String(p.categoryId) === categoryId);

    const content = sortMockProducts(matched, sort);

    return HttpResponse.json({
      status: 'SUCCESS',
      message: '상품 목록',
      data: {
        content,
        last: true,
        first: true,
        size: content.length,
        number: 0,
        numberOfElements: content.length,
        empty: content.length === 0,
      },
      error: null,
      timestamp: nowIso(),
    });
  }),

  // GET /api/v1/products/filters — 필터 바텀시트(가격/브랜드/유형) 옵션 (#128)
  http.get(`${BASE}/api/v1/products/filters`, ({ request }) => {
    const params = new URL(request.url).searchParams;
    const keyword = params.get('keyword')?.trim() ?? '';
    const matched = keyword
      ? MOCK_PRODUCTS.filter((p) => matchesKeyword(p, keyword))
      : MOCK_PRODUCTS;

    return HttpResponse.json({
      status: 'SUCCESS',
      message: '필터 옵션',
      data: buildMockFilters(matched),
      error: null,
      timestamp: nowIso(),
    });
  }),

  // GET /api/v1/products/categories — 필터 바텀시트 "카테고리" 탭 옵션 (#128, 파라미터 없음)
  http.get(`${BASE}/api/v1/products/categories`, () => {
    return HttpResponse.json({
      status: 'SUCCESS',
      message: '카테고리 목록',
      data: {
        STANDARD: MOCK_CATEGORIES.map((c, i) => ({
          id: c.id,
          name: c.name,
          type: 'STANDARD',
          sequence: i + 1,
          children: [],
        })),
        DISPLAY: [],
      },
      error: null,
      timestamp: nowIso(),
    });
  }),
];
