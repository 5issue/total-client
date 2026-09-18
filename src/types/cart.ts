import { z } from 'zod';

/**
 * 장바구니 도메인 스키마 — 이슈 #118.
 *
 * - GET    /api/v1/carts                    장바구니 조회(배송 그룹별)
 * - PATCH  /api/v1/carts/items/{cartItemId} 수량 변경
 * - DELETE /api/v1/carts/items              상품 삭제(단일·다건 공통 — id 배열)
 *
 * 쿠폰·추천 상품·주문 전환(체크아웃 연동)은 범위 밖(이슈 #118 코멘트).
 */

export const CartTemperatureSchema = z.enum(['REFRIGERATED', 'FROZEN']);
export type CartTemperature = z.infer<typeof CartTemperatureSchema>;

export const CartItemSchema = z.object({
  cartItemId: z.number().int().positive(),
  productId: z.number().int().positive(),
  skuId: z.number().int().positive(),
  name: z.string().min(1),
  thumbnailUrl: z.string().url().nullable(),
  /** 판매가(원). */
  price: z.number().nonnegative(),
  /** 정가(원). 판매가와 같으면(할인 없음) null. */
  originalPrice: z.number().nonnegative().nullable(),
  quantity: z.number().int().positive(),
  soldOut: z.boolean(),
  temperature: CartTemperatureSchema,
});
export type CartItem = z.infer<typeof CartItemSchema>;

export const CartDeliveryGroupSchema = z.object({
  groupId: z.string().min(1),
  deliveryLabel: z.string().min(1),
  /** 배송 유형 선택 여부 — 조회 시점 서버 값. 화면에서 토글은 로컬(서버로 되돌려 쓰지 않음). */
  checked: z.boolean(),
  shippingFee: z.number().nonnegative(),
  items: z.array(CartItemSchema),
});
export type CartDeliveryGroupResponse = z.infer<typeof CartDeliveryGroupSchema>;

export const CartResponseSchema = z.object({
  groups: z.array(CartDeliveryGroupSchema),
});
export type CartResponse = z.infer<typeof CartResponseSchema>;

// ── 수량 변경 (PATCH /api/v1/carts/items/{cartItemId}) ─────────────────────

export const UpdateCartItemQuantityRequestSchema = z.object({
  quantity: z.number().int().positive(),
});
export type UpdateCartItemQuantityRequest = z.infer<typeof UpdateCartItemQuantityRequestSchema>;

export const UpdateCartItemQuantityResponseSchema = z.object({
  cartItemId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});
export type UpdateCartItemQuantityResponse = z.infer<typeof UpdateCartItemQuantityResponseSchema>;

// ── 상품 삭제 (DELETE /api/v1/carts/items) ──────────────────────────────────

export const RemoveCartItemsRequestSchema = z.object({
  cartItemIds: z.array(z.number().int().positive()).min(1),
});
export type RemoveCartItemsRequest = z.infer<typeof RemoveCartItemsRequestSchema>;

export const RemoveCartItemsResponseSchema = z.object({
  removedCartItemIds: z.array(z.number().int().positive()),
});
export type RemoveCartItemsResponse = z.infer<typeof RemoveCartItemsResponseSchema>;
