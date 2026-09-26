import { z } from 'zod';

/**
 * My냉장고 도메인 스키마 — AI 파트 API 명세 v0.3 §04~05 기준 (이슈 #138).
 * FRIDGE-01(목록)·FRIDGE-04(삭제)만 이번 이슈 범위. FRIDGE-02/03(추가·수정)은 현재
 * 화면에 대응 UI 트리거가 없어 스키마도 아직 만들지 않는다.
 *
 * ⚠️ FRIDGE-01~04는 명세 문서 기준 "리뷰중" — 병합 전 로컬 AI 서버(`localhost:8000/docs`)
 * 최신 스키마로 재확인 필요. 특히 `ingredients[]`/`storageType` 세부 값은 명세에 필드
 * 목록 정도만 나와 있어(밀키트 대응으로 배열이라는 것만 명시) 최소 형태로 잡았다.
 */

export const FridgeProductSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string(),
  /** 원문 그대로 보관 — 실제 enum 값 미확정. 화면 매핑은 MyFridgeView/mapFridgeItem.ts. */
  storageType: z.string(),
});
export type FridgeProduct = z.infer<typeof FridgeProductSchema>;

export const FridgeIngredientSchema = z.object({
  name: z.string(),
});

/** FRIDGE-01 목록 응답의 품목 하나. 품목 키는 `product.id`(`fridge_item_id` 없음, 명세
 *  원문도 "FE 확인 대기" 상태). */
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

/** DELETE 성공 응답 — 명세 §05-3: `data: null`. */
export const FridgeDeleteResponseSchema = z.null();

/** DELETE `/api/fridge/[productId]` 경로 파라미터 검증. */
export const FridgeProductIdParamSchema = z.string().min(1);
