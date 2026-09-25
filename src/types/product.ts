import { z } from 'zod';

import { MoneySchema } from './common';

/**
 * 상품 도메인 스키마 — 검색 결과(`/search`) 상품 그리드(Figma "Item_V_XL", node
 * 882-60583)가 1차 소비처다. 상세/카테고리 등 다른 화면에서 필드가 더 필요해지면
 * 이 스키마를 확장한다(별도 파일로 쪼개지 않는다 — api-convention §5, 도메인당 1파일).
 *
 * ⚠️ `product-service`(백엔드 레포 `services/product-service/api-spec`)의 실제
 * `ProductSummaryResponse`엔 `reviewCount`/`couponBadgeLabel`/`deliveryType`/`kurlyOnly`/
 * `membershipBenefit`이 전혀 없다(백엔드는 `likeCount`만 준다) — 전부 Figma 목업(#90) 기준
 * 필드였다. `mapSpringProductListResponse`가 안전한 기본값(null/false/빈 문자열)으로
 * 채우고 있고, 실제로 이 정보를 어디서 가져올지는 디자인/백엔드와 별도 협의가 필요하다.
 */
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  /**
   * 상품 썸네일. 실제 백엔드는 CDN 절대 URL 을 주지만, 이미지 API 미연동 구간의
   * 목데이터는 `public/` 에 둔 플레이스홀더를 루트 상대경로로 준다(#90) — 둘 다 허용한다.
   */
  thumbnailUrl: z.union([z.string().url(), z.string().regex(/^\//)]),
  /** 최종 판매가. */
  price: MoneySchema,
  /** 할인 전 정가. `discountRate` 와 함께 있을 때만 취소선으로 노출한다. */
  originalPrice: MoneySchema.nullable(),
  /** 할인율(예: 25 → "25%"). */
  discountRate: z.number().int().min(0).max(100).nullable(),
  /** 리뷰 개수. 9999 이상은 "9,999+" 로 표기(표시 포맷은 컴포넌트 책임). */
  reviewCount: z.number().int().nonnegative().nullable(),
  /** 쿠폰 할인 뱃지 텍스트(예: "+25%쿠폰"). 없으면 null. */
  couponBadgeLabel: z.string().nullable(),
  /** 배송 타입 라벨(예: "샛별배송"). */
  deliveryType: z.string(),
  /** 컬리멤버스 전용 상품 여부. */
  kurlyOnly: z.boolean().default(false),
  /** 멤버스 혜택(추가 할인) 적용 상품 여부. */
  membershipBenefit: z.boolean().default(false),
});
export type Product = z.infer<typeof ProductSchema>;

/** Spring `PriceBand` 값(`PriceBand.java` 기준) — 이 5개 문자열만 유효하다. */
const PRICE_BAND_VALUES = ['0-5000', '5000-10000', '10000-20000', '20000-30000', '30000-'] as const;
/**
 * Spring `ProductSpec.StorageType` 값 — 실제 백엔드 enum이다(TypeSpec 문서가 가리키는
 * `domain.enums.StorageType`는 존재하지 않는 클래스 경로였다, #128).
 */
const STORAGE_TYPE_VALUES = ['REFRIGERATED', 'FROZEN', 'ROOM_TEMPERATURE'] as const;

/**
 * `GET /api/products`(우리 Route Handler) 요청 파라미터.
 *
 * 백엔드 레포(`5issue/total-backend`, `services/product-service/api-spec`)의
 * TypeSpec 명세로 확인 완료. Spring 쪽 실제 쿼리 파라미터명은 `keyword`(우리 `query`가
 * 아님) — 매핑은 route.ts 에서 처리한다. `categoryId`/`keyword` 중 최소 하나가 필요하고
 * (우리는 항상 keyword만 사용), sort 는 `ProductSortType` 6종과 1:1 대응(§SPRING_SORT_MAP).
 */
export const ProductListParamsSchema = z.object({
  query: z.string().min(1),
  sort: z
    .enum(['recommend', 'new', 'sales', 'benefit', 'priceAsc', 'priceDesc'])
    .default('recommend'),
  brand: z.string().optional(),
  /**
   * #128: `price` 값이 이 5개 중 하나가 아니면 백엔드가 400이 아니라 500을 낸다(알려진
   * 버그, `PriceBand.from()`). enum 으로 막아 잘못된 값이 여기서부터 못 나가게 한다.
   */
  price: z.enum(PRICE_BAND_VALUES).optional(),
  storageType: z.enum(STORAGE_TYPE_VALUES).optional(),
  /** `Category.id` 문자열화(#128). 최상위 카테고리만 선택 가능한 이유는 `mapSpringCategories` 참고. */
  categoryId: z.string().optional(),
});
export type ProductListParams = z.infer<typeof ProductListParamsSchema>;

/** 우리 내부 sort 값 → Spring `ProductSortType`(대문자 상수). route.ts 가 전송 직전 변환에 사용(#128). */
export const SPRING_SORT_MAP: Record<ProductListParams['sort'], string> = {
  recommend: 'RECOMMENDED',
  new: 'LATEST',
  sales: 'POPULAR',
  benefit: 'BENEFIT',
  priceAsc: 'PRICE_ASC',
  priceDesc: 'PRICE_DESC',
};

export const ProductListResponseSchema = z.object({
  items: z.array(ProductSchema),
  /**
   * Spring 이 `Slice`(무한스크롤 전제, `Page`가 아님)를 쓰기 때문에 총 개수를 안 준다 —
   * 그래서 공용 `PaginationSchema`(totalCount 필수)를 그대로 쓰지 않고 이 모양으로 둔다(#128).
   * 검색 결과 화면은 아직 페이지네이션/무한스크롤을 소비하지 않는다(`useProducts` 확인) —
   * 나중에 붙일 때 이 필드를 쓰면 된다.
   */
  pagination: z.object({
    hasNext: z.boolean(),
    /** 다음 요청 시 보낼 `page` 값. 마지막 페이지면 null. */
    nextPage: z.number().int().nullable(),
  }),
});
export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;

/**
 * Spring `GET /api/v1/products` 실제 응답 원본(`ProductSummaryResponse`/`SliceResponse<T>`,
 * `product-service` 레포 `api-spec/models/products.dto.tsp` 기준).
 *
 * ⚠️ `SliceResponse` 필드 구성은 백엔드 팀 스스로도 "Jackson 기본 직렬화 규칙으로 추정,
 * 실행 중인 서버로 미검증"이라 명시한 값이다 — 로컬 백엔드가 뜨면 실제 응답으로 재확인할 것.
 */
const SpringProductSummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  brand: z.string(),
  /** 정가. 우리 `ProductSchema.originalPrice`에 대응(우리 `price`가 아니다 — 이름이 반대). */
  price: z.number(),
  /** 판매가(최종가). 우리 `ProductSchema.price`에 대응. */
  salePrice: z.number(),
  discountRate: z.number().int(),
  /** 찜(좋아요) 수. 우리 `ProductSchema.reviewCount`(리뷰 수)와 다른 지표 — 대응 없음. */
  likeCount: z.number().int(),
  thumbnailUrl: z.string(),
});

const SpringSliceResponseSchema = z.object({
  content: z.array(SpringProductSummarySchema),
  last: z.boolean(),
  first: z.boolean(),
  size: z.number().int(),
  number: z.number().int(),
  numberOfElements: z.number().int(),
  empty: z.boolean(),
});
export const SpringProductListDataSchema = SpringSliceResponseSchema;

/**
 * Spring 원본 응답 → 우리 UI 모델 매핑(route.ts 에서 호출).
 *
 * 이번 이슈는 전체 재구현이 아니라 백엔드가 실제로 구현한 부분(이름/가격/할인율/
 * 썸네일)만 실데이터로 교체하는 범위다. `ProductSummaryResponse`에 아예 없는 나머지 필드
 * (리뷰 수·쿠폰·배송타입·Kurly Only·멤버스혜택)는 백엔드 미구현 상태이므로 기존 #90 Figma
 * 목업 값을 그대로 mock 으로 남겨둔다 — 백엔드가 필드를 추가하면 그때 이 자리들만 실데이터로
 * 바꾸면 된다.
 */
const MOCK_REVIEW_COUNT = 9999;
const MOCK_COUPON_BADGE_LABEL = '+25%쿠폰';
const MOCK_DELIVERY_TYPE = '샛별배송';

export function mapSpringProductListResponse(
  raw: z.infer<typeof SpringSliceResponseSchema>,
): ProductListResponse {
  return {
    items: raw.content.map((p) => ({
      id: String(p.id),
      // Spring은 brand/name을 분리해서 주지만 우리 카드(SearchResultProductCard)는
      // 이름 한 줄만 표시한다 — 기존 Figma 목업(#90)의 "[브랜드] 상품명" 표기를 유지.
      name: `[${p.brand}] ${p.name}`,
      thumbnailUrl: p.thumbnailUrl,
      price: p.salePrice,
      originalPrice: p.price !== p.salePrice ? p.price : null,
      discountRate: p.discountRate || null,
      reviewCount: MOCK_REVIEW_COUNT,
      couponBadgeLabel: MOCK_COUPON_BADGE_LABEL,
      deliveryType: MOCK_DELIVERY_TYPE,
      // 백엔드 미구현. 검색 결과의 "Kurly Only" 퀵필터 칩(`useProducts.filterProducts`)이
      // 실제로 이 값으로 걸러내기 때문에 전부 false로 두면 그 필터가 토글할 때마다 결과 0개가
      // 되어버린다 — id 기반으로 갈라서 필터 데모가 계속 동작하게 둔다. 실제 상품별 Kurly
      // Only 여부는 백엔드가 필드를 추가하기 전까지는 알 수 없다(허구 데이터).
      kurlyOnly: p.id % 2 === 0,
      // 백엔드 미구현. 필터 칩은 있지만(§멤버스혜택) 원래 #90 목업도 전부 false라
      // 토글하면 0개가 되는 건 기존과 동일 — 새 회귀 아님.
      membershipBenefit: false,
    })),
    pagination: {
      hasNext: !raw.last,
      nextPage: raw.last ? null : raw.number + 1,
    },
  };
}

/** 필터 옵션 한 항목(라벨/전송값/현재 검색결과 내 개수). `GET /products` 에 되돌려보낼 값이 `value`다. */
export const ProductFilterItemSchema = z.object({
  label: z.string(),
  value: z.string(),
  count: z.number().int().nonnegative(),
});
export type ProductFilterItem = z.infer<typeof ProductFilterItemSchema>;

/**
 * `GET /api/products/filters`(우리 Route Handler) 응답 — 우리가 실제로 쓰는 3개 그룹만
 * 남긴다. `ProductFilterService.java` 확인 결과(#128):
 * - `sort` 그룹도 내려주지만 우리 UI가 이미 자체 정렬 옵션을 갖고 있어 쓰지 않는다.
 * - **카테고리 그룹은 이 응답에 없다** — "지금 검색 결과 안에 어떤 카테고리가 있는지"를
 *   집계해주는 데이터 소스가 아니라서다. 카테고리 옵션 자체는 별도 엔드포인트
 *   `GET /api/v1/products/categories`(전체 트리, 검색어와 무관)로 받는다 — 아래
 *   `mapSpringCategories` 참고.
 * - `storageType` 그룹의 백엔드 title은 실수로 `"포장타입"`이라 붙어 있다(코드 주석은 "보관방법
 *   필터"). 우리 쪽에서는 이 그룹을 "유형"(냉장/냉동/실온)으로 표기한다 — `FilterSheet` 참고.
 */
export const ProductFiltersSchema = z.object({
  brand: z.array(ProductFilterItemSchema),
  price: z.array(ProductFilterItemSchema),
  storageType: z.array(ProductFilterItemSchema),
});
export type ProductFilters = z.infer<typeof ProductFiltersSchema>;

const SpringFilterGroupSchema = z.object({
  filterId: z.string(),
  title: z.string(),
  items: z.array(ProductFilterItemSchema),
});

const SpringProductFilterResponseSchema = z.object({
  totalCount: z.number().int().nonnegative(),
  filterGroups: z.array(SpringFilterGroupSchema),
});
export const SpringProductFilterDataSchema = SpringProductFilterResponseSchema;

export function mapSpringProductFilters(
  raw: z.infer<typeof SpringProductFilterResponseSchema>,
): ProductFilters {
  const itemsOf = (filterId: string) =>
    raw.filterGroups.find((g) => g.filterId === filterId)?.items ?? [];
  return {
    brand: itemsOf('brand'),
    price: itemsOf('price'),
    storageType: itemsOf('storageType'),
  };
}

/** 필터 시트 "카테고리" 탭 옵션 한 항목. count 가 없다 — `/categories`는 개수를 안 준다. */
export const ProductCategorySchema = z.object({
  label: z.string(),
  value: z.string(),
});
export type ProductCategory = z.infer<typeof ProductCategorySchema>;
export const ProductCategoryListSchema = z.array(ProductCategorySchema);

/**
 * Spring `GET /api/v1/products/categories`(`CategoryController.java` 확인, #128) 응답 원본.
 * 실제 반환 타입은 `Map<CategoryType, List<CategoryResponse>>`(`CategoryType` 은
 * STANDARD/DISPLAY 둘뿐)이고, `CategoryResponse`는 `{id, name, type, sequence, children}`
 * 재귀 트리다 — 하위 카테고리는 이 필터 탭 범위에서 안 쓰므로 `children`은 그냥 무시한다
 * (Zod 가 알 수 없는 키를 기본으로 버림). `Collectors.groupingBy`라 어느 한쪽 타입 데이터가
 * 없으면 그 키 자체가 응답에서 빠질 수 있어 둘 다 optional 이다.
 */
const SpringCategoryNodeSchema = z.object({
  id: z.number(),
  name: z.string(),
});
export const SpringCategoryTreeDataSchema = z.object({
  STANDARD: z.array(SpringCategoryNodeSchema).optional(),
  DISPLAY: z.array(SpringCategoryNodeSchema).optional(),
});

/**
 * 카테고리 필터 탭은 최상위 STANDARD 카테고리만 단일선택으로 노출한다(#128, 제품 결정) —
 * DISPLAY(베스트/단독/멤버스/세일)는 홈 큐레이션 성격이라 상품 카테고리 필터와는 결이 달라
 * 제외한다. `searchProducts`가 `findAllSubCategoryIds`로 하위까지 걸러주므로 하위 카테고리를
 * 따로 노출하지 않아도 최상위 선택만으로 그 아래 상품 전체가 잡힌다.
 */
export function mapSpringCategories(
  raw: z.infer<typeof SpringCategoryTreeDataSchema>,
): ProductCategory[] {
  return (raw.STANDARD ?? []).map((c) => ({ label: c.name, value: String(c.id) }));
}
