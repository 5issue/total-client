import { z } from 'zod';

import { MoneySchema } from './common';

/**
 * 홈 도메인 스키마 — `GET /api/v1/products/home-recommendations`(`ProductController` →
 * `ProductQueryService.getHomeRecommendations`, product-service) 1차 소비처는
 * `HomeProductSections`(퀵메뉴 + 진열 3섹션을 한 응답으로 받는다)다.
 *
 * 백엔드는 섹션 4개를 고정 반환한다: `QUICK_MENU`(quickMenus 채움) 1개 +
 * `TOP_LIKED_PRODUCTS`/`TOP_DISCOUNTED_PRODUCTS`/`TOP_REPURCHASE_PRODUCTS`(products 채움)
 * 3개. 섹션마다 `quickMenus`/`products` 중 하나만 채워지고 나머지는 `null`이다
 * (`HomeResponse.HomeSection` 소스 확인) — `type`을 하드코딩해서 분기하지 않고 어느 배열이
 * 채워져 있는지로 구분한다(백엔드가 섹션을 추가/변경해도 프론트가 덜 깨지도록).
 */
export const HomeQuickMenuSchema = z.object({
  title: z.string(),
  /**
   * 백엔드 `HomeLayoutProvider`가 주는 값(`/images/quickmenu/*.png`)은 이 경로를 서빙하는
   * 정적 리소스 핸들러가 백엔드에 없어(grep 확인) 실제로 로드되지 않는 placeholder다.
   * 그대로 스키마엔 담아두되, 컴포넌트에서는 쓰지 않고 로컬 아이콘 세트로 대체한다.
   */
  imageUrl: z.string(),
  linkUrl: z.string(),
});
export type HomeQuickMenu = z.infer<typeof HomeQuickMenuSchema>;

/** `HomeResponse.ProductSummaryDto` 1:1 — 배송타입/리뷰수/쿠폰뱃지/kurlyOnly 필드가 없다. */
export const HomeSectionProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  brand: z.string(),
  price: MoneySchema,
  salePrice: MoneySchema,
  discountRate: z.number().int().min(0).max(100).nullable(),
  likeCount: z.number().int().nonnegative().nullable(),
  thumbnailUrl: z.union([z.string().url(), z.string().regex(/^\//)]).nullable(),
});
export type HomeSectionProduct = z.infer<typeof HomeSectionProductSchema>;

export const HomeSectionSchema = z.object({
  type: z.string(),
  title: z.string(),
  quickMenus: z.array(HomeQuickMenuSchema).nullable(),
  products: z.array(HomeSectionProductSchema).nullable(),
});
export type HomeSection = z.infer<typeof HomeSectionSchema>;

export const HomeRecommendationsResponseSchema = z.object({
  sections: z.array(HomeSectionSchema),
});
export type HomeRecommendationsResponse = z.infer<typeof HomeRecommendationsResponseSchema>;
