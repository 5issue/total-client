import { z } from 'zod';

/**
 * 회원 프로필(`GET /api/v1/users/me/profile`) — user-service `UserProfileResponse` 그대로.
 * `name`과 기본 배송지만 내려온다 — 닉네임 외 적립금/컬리캐시/매일혜택포인트/상품권 필드는
 * 백엔드에 아예 없다(이슈 #148, `UserProfileResponse.java` 확인). `defaultAddress`는
 * 배송지를 한 건도 등록하지 않은 회원에서 null이다.
 *
 * `name`도 실제로 null이 내려오는 계정이 있다(2026-09-29 실 백엔드 확인, `min(1)`로
 * 뒀더니 그 계정에서 502) — `PromoSummarySectionContainer`가 null이면 mock 닉네임으로
 * 폴백한다.
 */
export const UserProfileDefaultAddressSchema = z.object({
  addressId: z.number().int().positive(),
  addressName: z.string().min(1),
  recipientName: z.string().min(1),
  zipCode: z.string().min(1),
  address: z.string().min(1),
  addressDetail: z.string().nullable(),
  accessMethod: z.string().nullable(),
});

export const UserProfileResponseSchema = z.object({
  name: z.string().nullable(),
  defaultAddress: UserProfileDefaultAddressSchema.nullable(),
});
export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>;
