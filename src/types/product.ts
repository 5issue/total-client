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
