import { z } from 'zod';

/**
 * My냉장고 기반 레시피 추천 스키마 — AI 파트 API 명세 v0.3 §04~05, RECO-02(개발완료)
 * 기준 (이슈 #138). 데이터 계층만 이번 범위 — `RecipeAiRecommendSection`(MyRecipeView)이
 * 필요로 하는 imageSrc/description/ingredients 상세/가격은 이 응답에 없어(레시피 상세
 * RECIPE-01 필요, 별도 이슈) 아직 화면에 연결하지 않는다.
 *
 * ⚠️ `missing_ingredients[]` 세부 필드는 명세에 이름 정도만 나와 있어 최소 형태로 잡았다 —
 * 실제 응답 구조는 로컬 AI 서버(`localhost:8000/docs`)로 재확인 필요.
 */

export const RecipeMatchSchema = z.object({
  required: z.number(),
  available: z.number(),
  missing: z.number(),
  match_rate: z.number(),
});
export type RecipeMatch = z.infer<typeof RecipeMatchSchema>;

export const RecipeMissingIngredientSchema = z.object({
  name: z.string(),
});

export const MyRecipeRecommendationItemSchema = z.object({
  recipe_id: z.union([z.string(), z.number()]).transform(String),
  name: z.string(),
  difficulty: z.string().nullable().optional(),
  cook_time_min: z.number().nullable().optional(),
  servings: z.number().nullable().optional(),
  recommendation_reason: z.string().nullable().optional(),
  match: RecipeMatchSchema,
  missing_ingredients: z.array(RecipeMissingIngredientSchema),
});
export type MyRecipeRecommendationItem = z.infer<typeof MyRecipeRecommendationItemSchema>;

export const MyRecipeRecommendationsResponseSchema = z.object({
  items: z.array(MyRecipeRecommendationItemSchema),
});
export type MyRecipeRecommendationsResponse = z.infer<typeof MyRecipeRecommendationsResponseSchema>;

/** GET 쿼리 파라미터 (명세 §04-1). */
export const MyRecipeRecommendationParamsSchema = z.object({
  minMatchRate: z.number().min(0).max(1).default(0.5),
  limit: z.number().int().min(1).max(50).default(10),
});
export type MyRecipeRecommendationParams = z.infer<typeof MyRecipeRecommendationParamsSchema>;
