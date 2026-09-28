import { z } from 'zod';

/**
 * 장바구니 도메인 스키마 — 이슈 #118.
 *
 * - GET    /api/v1/carts                     장바구니 조회(배송 그룹별)
 * - POST   /api/v1/carts/items               상품 담기(다건 — `items` 배열, 백엔드가
 *                                             2026-09-23 신규 추가)
 * - PATCH  /api/v1/carts/items/{productId}   수량 변경 — 경로 파라미터는 `cartItemId` 가
 *                                             아니라 `productId` 다(`CartController`/
 *                                             `CartService.updateItemQuantity` 확인,
 *                                             2026-09-24). 응답은 `Void`.
 * - DELETE /api/v1/carts/items/{productId}   단일 삭제 — 이것도 `productId`. 응답 `Void`.
 * - DELETE /api/v1/carts/items               다건 삭제 — 요청 `productIds`, 응답
 *                                             `deletedProductIds`(모두 상품 ID 배열).
 * - PUT    /api/v1/carts/delivery-address    배송지 변경
 *
 * 쿠폰·추천 상품·주문 전환(체크아웃 연동)은 범위 밖(이슈 #118 코멘트).
 */

/**
 * 아래 GET/POST 공용 응답 스키마(`CartItemSchema`~`CartResponseSchema`)는 원래 스펙(이슈
 * #118) 기준으로 작성됐으나, 실제 order-service 응답(`CartResponseDto`, `/v3/api-docs`
 * 로 확인)과 구조가 크게 달랐다 — `groupId`/`deliveryLabel`/`checked`/`name`/`price`/
 * `originalPrice`/`soldOut` 같은 필드 자체가 없고, 대신 `deliveryType`/`temperatureType`/
 * `seller`/`title`/`unitPrice`/`available`/`groupItemAmount`/`groupDeliveryFee`/
 * `selectedAddress`/`amountSummary` 로 내려온다. 실 응답 기준으로 다시 맞췄다(2026-09-23,
 * 실 백엔드 담기 플로우 검증 중 발견 — 아이템이 있는 장바구니를 한 번도 실제로 조회해본
 * 적이 없어 이제껏 안 드러났다).
 */
export const CartTemperatureSchema = z.enum(['ROOM_TEMPERATURE', 'REFRIGERATED', 'FROZEN']);
export type CartTemperature = z.infer<typeof CartTemperatureSchema>;

export const CartDeliveryTypeSchema = z.enum(['DAWN', 'PARCEL', 'SELLER']);
export type CartDeliveryType = z.infer<typeof CartDeliveryTypeSchema>;

export const CartItemSchema = z.object({
  cartItemId: z.number().int().positive(),
  productId: z.number().int().positive(),
  skuId: z.number().int().positive().nullable(),
  title: z.string().min(1),
  thumbnailUrl: z.string().url().nullable(),
  unitPrice: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  maxQuantity: z.number().int().positive(),
  available: z.boolean(),
});
export type CartItem = z.infer<typeof CartItemSchema>;

export const CartSellerSchema = z.object({
  sellerId: z.number().int().positive(),
  sellerName: z.string().min(1),
});

export const CartDeliveryGroupSchema = z.object({
  deliveryType: CartDeliveryTypeSchema.nullable(),
  temperatureType: CartTemperatureSchema,
  seller: CartSellerSchema.nullable(),
  items: z.array(CartItemSchema),
  groupItemAmount: z.number().nonnegative(),
  groupDeliveryFee: z.number().nonnegative(),
});
export type CartDeliveryGroupResponse = z.infer<typeof CartDeliveryGroupSchema>;

export const CartAddressSchema = z.object({
  addressId: z.number().int().positive(),
  addressName: z.string().nullable(),
  recipientName: z.string().min(1),
  recipientPhone: z.string().min(1),
  zipCode: z.string().min(1),
  address: z.string().min(1),
  detailAddress: z.string().nullable(),
});

export const CartAmountSummarySchema = z.object({
  totalItemAmount: z.number().nonnegative(),
  discountAmount: z.number().nonnegative(),
  deliveryFee: z.number().nonnegative(),
  paymentAmount: z.number().nonnegative(),
});

export const CartResponseSchema = z.object({
  selectedAddress: CartAddressSchema.nullable(),
  groups: z.array(CartDeliveryGroupSchema),
  amountSummary: CartAmountSummarySchema,
});
export type CartResponse = z.infer<typeof CartResponseSchema>;

// ── 상품 담기 (POST /api/v1/carts/items) ────────────────────────────────────

export const AddCartItemsRequestSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});
export type AddCartItemsRequest = z.infer<typeof AddCartItemsRequestSchema>;

/** 응답은 조회(`CartResponseSchema`)와 동일 — 담기 후 장바구니 전체 스냅샷을 그대로 준다. */

// ── 수량 변경 (PATCH /api/v1/carts/items/{productId}) ──────────────────────

export const UpdateCartItemQuantityRequestSchema = z.object({
  quantity: z.number().int().positive(),
});
export type UpdateCartItemQuantityRequest = z.infer<typeof UpdateCartItemQuantityRequestSchema>;

/** 응답은 `Void` — 백엔드가 데이터를 내려주지 않는다. 성공 판정은 상태값만으로 한다. */
export const CartVoidResponseSchema = z.null();

// ── 상품 삭제 (DELETE /api/v1/carts/items/{productId}, DELETE /api/v1/carts/items) ──

export const RemoveCartItemsRequestSchema = z.object({
  productIds: z.array(z.number().int().positive()).min(1),
});
export type RemoveCartItemsRequest = z.infer<typeof RemoveCartItemsRequestSchema>;

export const RemoveCartItemsResponseSchema = z.object({
  deletedProductIds: z.array(z.number().int().positive()),
});
export type RemoveCartItemsResponse = z.infer<typeof RemoveCartItemsResponseSchema>;

// ── 배송지 변경 (PUT /api/v1/carts/delivery-address) ────────────────────────

export const DeliveryAddressRequestSchema = z.object({
  addressId: z.number().int().positive(),
});
export type DeliveryAddressRequest = z.infer<typeof DeliveryAddressRequestSchema>;

export const DeliveryAddressResponseSchema = z.object({
  /** 조회(`CartResponseSchema.selectedAddress`)와 달리 여기선 항상 온다(`DeliveryAddressResponseDto`). */
  selectedAddress: CartAddressSchema,
  deliverable: z.boolean(),
  deliveryType: CartDeliveryTypeSchema,
  cutoffAt: z.string(),
  expectedDeliveryAt: z.string(),
});
export type DeliveryAddressResponse = z.infer<typeof DeliveryAddressResponseSchema>;
