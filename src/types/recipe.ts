import { z } from 'zod';

/**
 * My냉장고 기반 레시피 추천(RECO-02) + 레시피 상세(RECIPE-01) + 부족 재료 상품
 * 추천(RECIPE-03) 스키마 — AI 서빙 레포(`KDT-2-AI-Integrated-Project-Team5-AI`)의
 * 실제 Pydantic 스키마(`serving/src/serving/schemas.py`)를 소스로 직접 확인해
 * 맞췄다(2026-09-26, 문서 표기 추정 아님).
 */

export const RecipeMatchSchema = z.object({
  required_ingredients: z.number(),
  available_ingredients: z.number(),
  missing_ingredients: z.number(),
  match_rate: z.number(),
});
export type RecipeMatch = z.infer<typeof RecipeMatchSchema>;

export const RecipeMissingIngredientSchema = z.object({
  ingredient_id: z.union([z.string(), z.number()]).optional(),
  name: z.string(),
});

export const MyRecipeRecommendationItemSchema = z.object({
  recipe_id: z.union([z.string(), z.number()]).transform(String),
  name: z.string(),
  difficulty: z.string().nullable().optional(),
  cook_time_min: z.number().nullable().optional(),
  servings: z.number().nullable().optional(),
  recommendation_reason: z.string(),
  match: RecipeMatchSchema,
  missing_ingredients: z.array(RecipeMissingIngredientSchema),
});
export type MyRecipeRecommendationItem = z.infer<typeof MyRecipeRecommendationItemSchema>;

export const MyRecipeRecommendationsResponseSchema = z.object({
  items: z.array(MyRecipeRecommendationItemSchema),
});
export type MyRecipeRecommendationsResponse = z.infer<typeof MyRecipeRecommendationsResponseSchema>;

/**
 * GET 쿼리 파라미터. `min_match_rate`는 라우터에 쿼리 파라미터 자체가 없다 — 서버가
 * `MIN_MATCH_RATE = 0.5` 상수로 고정한다(레포 소스 `routers/recommendations.py`
 * 확인, 2026-09-26). `limit`만 실제 쿼리 파라미터다.
 */
export const MyRecipeRecommendationParamsSchema = z.object({
  limit: z.number().int().min(1).max(50).default(10),
});
export type MyRecipeRecommendationParams = z.infer<typeof MyRecipeRecommendationParamsSchema>;

/** 레시피 재료 한 줄(`RecipeIngredientLine`). */
export const RecipeIngredientApiSchema = z.object({
  ingredient_id: z.union([z.string(), z.number()]).optional(),
  name: z.string(),
  quantity: z.number().nullable().optional(),
  unit: z.string().nullable().optional(),
  is_required: z.boolean().optional(),
  is_pantry: z.boolean().optional(),
  purpose: z.string().nullable().optional(),
});
export type RecipeIngredientApi = z.infer<typeof RecipeIngredientApiSchema>;

/** 조리 단계 한 줄(`RecipeStep`) — 명세 문서엔 없지만 실제 응답엔 있다. */
export const RecipeStepSchema = z.object({
  step_no: z.number(),
  instruction: z.string(),
  image_url: z.string().nullable().optional(),
});
export type RecipeStepApi = z.infer<typeof RecipeStepSchema>;

/**
 * 영양 정보 — 원본 키(`protein_g`/`sodium_mg` 등) 그대로 받기로 확정(2026-09-26),
 * 원천마다 채워진 항목이 달라 없는 키는 응답에서 아예 빠질 수 있다. 정확한 키 목록을
 * 아직 몰라 임의 키 → 숫자|null 레코드로 느슨하게 받는다. 현재 화면(`Recipe` 모델·
 * `RecipeDetailView`)엔 영양정보 노출 자리가 없어 이번 이슈에서 렌더하지 않는다.
 */
export const RecipeNutritionSchema = z.record(z.string(), z.number().nullable()).optional();

export const RecipeDetailSchema = z.object({
  recipe_id: z.union([z.string(), z.number()]).transform(String),
  name: z.string(),
  description: z.string().nullable().optional(),
  /** 실제로 있다 — mapRecipe.ts가 mock 대신 이 값을 쓴다. */
  image_url: z.string().nullable().optional(),
  difficulty: z.string().nullable().optional(),
  prep_time_min: z.number().nullable().optional(),
  cook_time_min: z.number().nullable().optional(),
  servings: z.number().nullable().optional(),
  cooking_method: z.string().nullable().optional(),
  nutrition: RecipeNutritionSchema,
  ingredients: z.array(RecipeIngredientApiSchema).default([]),
  /** 명세 문서엔 없지만 실제 응답엔 있다(상세 화면이 항상 필요로 해서 서버가 같이
   *  낸다) — mapRecipe.ts가 mock 대신 이 값을 쓴다. */
  steps: z.array(RecipeStepSchema).default([]),
});
export type RecipeDetail = z.infer<typeof RecipeDetailSchema>;

/** 부족 재료로 살 수 있는 상품 한 줄(`MissingProductOption`). `image_url` 필드 자체가
 *  없다(컬럼 마이그레이션 전) — 화면에선 placeholder로 채운다(mapRecipe.ts). */
export const MissingProductSchema = z.object({
  product_id: z.union([z.string(), z.number()]).transform(String),
  name: z.string(),
  price: z.number(),
  rank: z.number(),
});
export type MissingProduct = z.infer<typeof MissingProductSchema>;

export const RecipeMissingIngredientWithProductsSchema = z.object({
  ingredient_id: z.union([z.string(), z.number()]).optional(),
  name: z.string(),
  products: z.array(MissingProductSchema).default([]),
});

export const MissingProductsResponseSchema = z.object({
  recipe_id: z.union([z.string(), z.number()]).transform(String),
  missing_ingredients: z.array(RecipeMissingIngredientWithProductsSchema).default([]),
});
export type MissingProductsResponse = z.infer<typeof MissingProductsResponseSchema>;

/** GET 쿼리 파라미터. `base_product_id` 0(기본값)이면 미사용. */
export const MissingProductsParamsSchema = z.object({
  baseProductId: z.number().int().nonnegative().default(0),
  maxPerIngredient: z.number().int().min(1).max(10).default(3),
});
export type MissingProductsParams = z.infer<typeof MissingProductsParamsSchema>;

/**
 * 찜한 레시피(FAV-01~03) 스키마 — AI 서빙 레포 실제 Pydantic 스키마
 * (`serving/src/serving/schemas.py`: `RecipeCard`/`FavoriteRecipeItem`/`FavoriteRecipeSummary`)와
 * 로컬 서버 실 호출(`X-User-Id: 9200000002`, recipe_id 3221)로 직접 확인해 맞췄다(2026-09-29).
 */
export const FavoriteRecipeCardSchema = z.object({
  recipe_id: z.union([z.string(), z.number()]).transform(String),
  name: z.string(),
  image_url: z.string().nullable().optional(),
  difficulty: z.string().nullable().optional(),
  cook_time_min: z.number().nullable().optional(),
  servings: z.number().nullable().optional(),
  favorited_at: z.coerce.date(),
});
export type FavoriteRecipeCard = z.infer<typeof FavoriteRecipeCardSchema>;

export const FavoriteRecipeListResponseSchema = z.object({
  items: z.array(FavoriteRecipeCardSchema),
});
export type FavoriteRecipeListResponse = z.infer<typeof FavoriteRecipeListResponseSchema>;

/** POST /favorite-recipes/{recipe_id} 응답 data. */
export const FavoriteRecipeSummarySchema = z.object({
  recipe_id: z.union([z.string(), z.number()]).transform(String),
  favorited_at: z.coerce.date(),
});
export type FavoriteRecipeSummary = z.infer<typeof FavoriteRecipeSummarySchema>;

/** DELETE 성공 응답 — 냉장고(FRIDGE-04)와 동일하게 HTTP 200 + data: null. */
export const FavoriteRecipeDeleteResponseSchema = z.null();

/** GET 쿼리 파라미터. limit 1~100, 기본 50(서버 라우터 소스 확인). */
export const FavoriteRecipeListParamsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
});
export type FavoriteRecipeListParams = z.infer<typeof FavoriteRecipeListParamsSchema>;

/** POST/DELETE 경로 파라미터 검증. 실제론 숫자 id지만 URL 세그먼트라 문자열로 받는다
 *  (냉장고 `FridgeProductIdParamSchema`와 동일 컨벤션). */
export const FavoriteRecipeIdParamSchema = z.string().min(1);

/**
 * 최근 본 레시피(RECENT-01~03) 스키마 — FAV-01~03과 같은 `RecipeCard` 공통 모양에
 * `viewed_at`만 다르다(AI 서빙 레포 `serving/src/serving/schemas.py` 확인, 2026-10-01).
 */
export const RecentRecipeCardSchema = z.object({
  recipe_id: z.union([z.string(), z.number()]).transform(String),
  name: z.string(),
  image_url: z.string().nullable().optional(),
  difficulty: z.string().nullable().optional(),
  cook_time_min: z.number().nullable().optional(),
  servings: z.number().nullable().optional(),
  viewed_at: z.coerce.date(),
});
export type RecentRecipeCard = z.infer<typeof RecentRecipeCardSchema>;

export const RecentRecipeListResponseSchema = z.object({
  items: z.array(RecentRecipeCardSchema),
});
export type RecentRecipeListResponse = z.infer<typeof RecentRecipeListResponseSchema>;

/** POST /recent-recipes/{recipe_id} 응답 data. */
export const RecentRecipeSummarySchema = z.object({
  recipe_id: z.union([z.string(), z.number()]).transform(String),
  viewed_at: z.coerce.date(),
});
export type RecentRecipeSummary = z.infer<typeof RecentRecipeSummarySchema>;

/** GET 쿼리 파라미터. limit 1~50, 기본 10(서버 라우터 소스 확인). */
export const RecentRecipeListParamsSchema = z.object({
  limit: z.number().int().min(1).max(50).default(10),
});
export type RecentRecipeListParams = z.infer<typeof RecentRecipeListParamsSchema>;

/** POST 경로 파라미터 검증. 찜과 동일 컨벤션. */
export const RecentRecipeIdParamSchema = z.string().min(1);

/**
 * DELETE /recent-recipes 요청 바디(RECENT-03). "전체선택 → 선택삭제"가 체크된 id를
 * 한 번에 보낸다. 서버 PK는 정수라 `recipe_id`(문자열 변환)와 달리 그대로 number로 받는다
 * (AI 서빙 레포 `RecentRecipeDeleteRequest` 확인, 2026-10-01). 화면이 한 번에 보여주는
 * 최대 건수(50)보다 넉넉한 100까지 허용 — 서버 제약과 동일.
 */
export const RecentRecipeDeleteRequestSchema = z.object({
  recipe_ids: z.array(z.number().int().min(1)).min(1).max(100),
});
export type RecentRecipeDeleteRequest = z.infer<typeof RecentRecipeDeleteRequestSchema>;

/** DELETE 응답 data — 실제 삭제된 건수. 기록에 없던 id는 세지 않는다. */
export const RecentRecipeDeleteResponseSchema = z.object({
  deleted_count: z.number(),
});
export type RecentRecipeDeleteResponse = z.infer<typeof RecentRecipeDeleteResponseSchema>;
