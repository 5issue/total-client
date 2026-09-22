import { z } from 'zod';

import { MoneySchema, PaginationSchema } from './common';

/**
 * 상품 도메인 스키마 — 검색 결과(`/search`) 상품 그리드(Figma "Item_V_XL", node
 * 882-60583)가 1차 소비처다. 상세/카테고리 등 다른 화면에서 필드가 더 필요해지면
 * 이 스키마를 확장한다(별도 파일로 쪼개지 않는다 — api-convention §5, 도메인당 1파일).
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

/** `GET /api/products` 요청 파라미터 — 검색 결과 조회. */
export const ProductListParamsSchema = z.object({
  query: z.string().min(1),
  sort: z
    .enum(['recommend', 'new', 'sales', 'benefit', 'priceAsc', 'priceDesc'])
    .default('recommend'),
});
export type ProductListParams = z.infer<typeof ProductListParamsSchema>;

export const ProductListResponseSchema = z.object({
  items: z.array(ProductSchema),
  pagination: PaginationSchema,
});
export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;

/** Spring `GET /api/v1/products` 성공 응답의 data. Route Handler 내부에서만 사용. */
export const SpringProductListDataSchema = ProductListResponseSchema;

/**
 * 상품 상세 스키마 — `/products/{id}` 화면(`ProductDetailView`)이 1차 소비처다.
 * 목록용 `ProductSchema`와 실제 백엔드 응답 구조가 달라(썸네일 하나가 아니라 `media[]`,
 * `deliveryType`/`kurlyOnly` 대신 `brand`/`status`) 재사용하지 않고 별도로 둔다.
 * `ProductDetailResponse`(product-service TypeSpec)의 필드 중 실제로 쓰는 것만 담는다 —
 * `createdAt`, `spec.attributes`(상품마다 키가 달라지는 자유 JSON) 등은 제외.
 */
export const ProductDetailMediaSchema = z.object({
  mediaUrl: z.string(),
  mediaRole: z.enum(['THUMBNAIL', 'DETAIL']),
});

/** 보관/포장 타입 — 값은 `ProductSpec` 엔티티의 Java enum과 1:1(라벨은 model.ts 참고). */
export const ProductSpecSchema = z.object({
  storageType: z.enum(['REFRIGERATED', 'FROZEN', 'ROOM_TEMPERATURE']),
  packagingType: z.enum(['PAPER', 'PLASTIC', 'FOAM', 'CARDBOARD']),
});
export type ProductSpec = z.infer<typeof ProductSpecSchema>;

/** 담기 시트(옵션 선택)가 소비하는 SKU 단위 상품. */
export const ProductUnitSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: MoneySchema,
  salePrice: MoneySchema,
  status: z.enum(['SALE', 'SOLDOUT', 'HIDDEN']),
});
export type ProductUnit = z.infer<typeof ProductUnitSchema>;

export const ProductDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  shortDescription: z.string(),
  brand: z.string(),
  price: MoneySchema,
  salePrice: MoneySchema,
  discountRate: z.number().int().min(0).max(100),
  status: z.enum(['SALE', 'SOLDOUT', 'HIDDEN']),
  media: z.array(ProductDetailMediaSchema),
  spec: ProductSpecSchema.nullable(),
  units: z.array(ProductUnitSchema),
});
export type ProductDetail = z.infer<typeof ProductDetailSchema>;

/**
 * Spring `GET /api/v1/products/{id}` 성공 응답의 data. Route Handler 내부에서만 사용.
 * Zod object 는 기본 strip 모드라 위에서 안 쓰는 실 응답 필드는 파싱 시 자동으로 걸러진다.
 */
export const SpringProductDetailDataSchema = ProductDetailSchema;
