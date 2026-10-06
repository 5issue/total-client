import { z } from 'zod';

/**
 * 상품 보관 가이드(PROD-03) 스키마 — AI 서빙 레포 소스(`serving/src/serving/schemas.py`
 * `StorageGuideItem`/`StorageGuideResponse`)로 직접 확인해 맞췄다(이슈 #142). Spring
 * `types/product.ts`와는 다른 백엔드라 분리한다(#138/#140과 동일 원칙).
 *
 * `storage_location`(냉장/냉동/상온)·`storage_context`(일반/구매후/개봉후/해동후)는
 * DB 제약으로 고정된 값이지만 원문 그대로 문자열로 받는다 — 화면 매핑은 소비처 책임.
 *
 * ⚠️ 실 dev DB로 여러 상품을 직접 조회해본 결과(2026-09-28) `tips`는 표본 전부
 * null이고 실제로 채워지는 값은 `duration_text`뿐이었다 — 소비처는 `tips` 단독
 * 의존 금지, `MyFridgeView/FridgeStorageTipBottomSheet.tsx`의
 * `describeStorageGuideItem` 참고.
 */
export const StorageGuideItemSchema = z.object({
  storage_location: z.string(),
  storage_context: z.string().nullable(),
  duration_min: z.number().nullable(),
  duration_max: z.number().nullable(),
  duration_unit: z.string().nullable(),
  duration_text: z.string().nullable(),
  tips: z.string().nullable(),
});
export type StorageGuideItem = z.infer<typeof StorageGuideItemSchema>;

export const StorageGuideResponseSchema = z.object({
  product_id: z.union([z.string(), z.number()]).transform(String),
  storage_type: z.string().nullable(),
  ingredient_name: z.string().nullable(),
  items: z.array(StorageGuideItemSchema),
});
export type StorageGuideResponse = z.infer<typeof StorageGuideResponseSchema>;
