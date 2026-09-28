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
