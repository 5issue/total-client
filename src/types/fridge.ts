import { z } from 'zod';

/**
 * My냉장고 도메인 스키마 — AI 서빙 레포(`KDT-2-AI-Integrated-Project-Team5-AI`)의
 * 실제 Pydantic 스키마(`serving/src/serving/schemas.py` `FridgeProductRef`/
 * `FridgeIngredientRef`/`FridgeItem`/`FridgeListResponse`) 기준으로 맞춤(2026-09-26,
 * 로컬 레포 소스 직접 확인). FRIDGE-01(목록)·FRIDGE-04(삭제)만 이번 이슈(#138) 범위.
 * FRIDGE-02/03(추가·수정)은 현재 화면에 대응 UI 트리거가 없어 스키마도 아직 만들지 않는다.
 */

export const FridgeProductSchema = z.object({
  product_id: z.union([z.string(), z.number()]).transform(String),
  name: z.string(),
  /** 원문 그대로 보관 — 실제 enum 값 미확정. 화면 매핑은 MyFridgeView/mapFridgeItem.ts. */
  storage_type: z.string().nullable(),
  weight_g: z.number().nullable().optional(),
});
export type FridgeProduct = z.infer<typeof FridgeProductSchema>;

export const FridgeIngredientSchema = z.object({
  ingredient_id: z.union([z.string(), z.number()]).optional(),
  name: z.string(),
});

/** FRIDGE-01 목록 응답의 품목 하나. 품목 키는 `product.product_id`(`fridge_item_id`
 *  없음 — user_fridge PK가 (ingredient_id, user_id, product_id) 복합키라서). */
export const FridgeStockItemSchema = z.object({
  product: FridgeProductSchema,
  ingredients: z.array(FridgeIngredientSchema),
  quantity: z.number(),
  unit: z.string(),
  expires_at: z.string().nullable(),
  is_expired: z.boolean(),
});
export type FridgeStockItem = z.infer<typeof FridgeStockItemSchema>;

export const FridgeListResponseSchema = z.object({
  items: z.array(FridgeStockItemSchema),
});
export type FridgeListResponse = z.infer<typeof FridgeListResponseSchema>;

/** DELETE 성공 응답 — `data: null`(합의대로 HTTP 200 + envelope). */
export const FridgeDeleteResponseSchema = z.null();

/** DELETE `/api/fridge/[productId]` 경로 파라미터 검증. */
export const FridgeProductIdParamSchema = z.string().min(1);
