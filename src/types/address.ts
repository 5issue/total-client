import { z } from 'zod';

/**
 * 배송지 입력 폼 스키마 (화면 폼 검증용). 백엔드 계약(Spring 응답)이 아니라
 * `AddressSearchPanel` 의 추가·수정 폼이 `zodResolver` 로 쓰는 스키마다 —
 * code-style-convention §4(수동 useState 폼 금지, 스키마는 types/ 에).
 *
 * 데이터 연결 시 서버 배송지 스키마(`AddressSchema` 등)를 여기에 추가하고
 * `organisms/mypage/model.ts` 의 `AddressView` 를 그로부터 파생하도록 교체한다.
 */

/** 휴대폰(하이픈/공백 제거 후 숫자만) — 010/011/016/017/018/019 + 7~8자리. */
export const PHONE_DIGITS_REGEX = /^01[016789]\d{7,8}$/;

const toDigits = (value: string) => value.replace(/[^0-9]/g, '');

export const AddressFormSchema = z
  .object({
    /** 카카오 우편번호 위젯 결과 — 사용자가 직접 편집하지 않는다. */
    zonecode: z.string().min(1),
    roadAddress: z.string().min(1),
    /** 상세주소(동/호 등). 선택. */
    detailAddress: z.string(),
    /** 유형칩 선택값. 미선택 가능. */
    aliasType: z.enum(['home', 'company', 'custom']).optional(),
    /** `직접입력` 일 때의 배송지 이름. `aliasType==='custom'` 이면 아래 refine 으로 필수화된다. */
    customAlias: z.string(),
    recipient: z.string().trim().min(1, '받으실 분을 입력해주세요'),
    phone: z
      .string()
      .refine((v) => PHONE_DIGITS_REGEX.test(toDigits(v)), '올바른 휴대폰 번호를 입력해주세요'),
    /** 수정 화면에서 "기본 배송지로 저장" 토글. */
    saveAsDefault: z.boolean(),
  })
  // custom 유형은 이름이 없으면 의미가 없다 — 공백만 있는 값도 거부.
  .refine((data) => data.aliasType !== 'custom' || data.customAlias.trim() !== '', {
    message: '배송지 이름을 입력해주세요',
    path: ['customAlias'],
  });

export type AddressFormFields = z.infer<typeof AddressFormSchema>;

/**
 * 새 배송지 "추가" 폼(`AddressDetailForm`, node 666-25887) 전용 스키마 — 위 `AddressFormSchema`
 * 와 달리 recipient/phone 이 없다(2026-09-14 확인: 받으실 분/휴대폰 입력 자체가 없는 화면 —
 * 로그인한 사용자 기본정보로 자동 채운다). detailAddress·customAlias 둘 다 선택(빈 값 허용) —
 * "직접입력"을 골라도 이름을 안 적어도 저장된다(2026-09-14 재확인).
 */
export const AddressDetailFormSchema = z.object({
  zonecode: z.string().min(1),
  roadAddress: z.string().min(1),
  detailAddress: z.string(),
  aliasType: z.enum(['home', 'company', 'custom']).optional(),
  customAlias: z.string(),
  saveAsDefault: z.boolean(),
});

export type AddressDetailFormFields = z.infer<typeof AddressDetailFormSchema>;

/** 폼이 검증을 통과한 값에서 저장용 값을 뽑을 때 쓰는 정규화 헬퍼. */
export const normalizePhone = toDigits;

// ── 서버 계약 (데이터 연동, 이슈 #119) ──────────────────────────────────────
//
// - GET    /api/v1/addresses               배송지 목록 조회
// - POST   /api/v1/addresses               배송지 추가
// - PUT    /api/v1/addresses/{addressId}   배송지 수정
// - DELETE /api/v1/addresses/{addressId}   배송지 삭제
//
// `deliveryType`(배송 유형 라벨)은 서버가 주소로 판정해 응답에만 실어준다 — 저장 요청엔 없다.

export const AddressAliasTypeSchema = z.enum(['HOME', 'COMPANY']);
export type AddressAliasType = z.infer<typeof AddressAliasTypeSchema>;

export const AddressSchema = z.object({
  addressId: z.number().int().positive(),
  /** 유형칩. `직접입력`이면 null — 이땐 `customAlias` 가 배송지 이름을 대신한다. */
  aliasType: AddressAliasTypeSchema.nullable(),
  customAlias: z.string().nullable(),
  zonecode: z.string().min(1),
  roadAddress: z.string().min(1),
  detailAddress: z.string().nullable(),
  recipient: z.string().min(1),
  phone: z.string().min(1),
  deliveryType: z.string().min(1),
  isDefault: z.boolean(),
});
export type Address = z.infer<typeof AddressSchema>;

export const AddressListResponseSchema = z.object({
  addresses: z.array(AddressSchema),
});
export type AddressListResponse = z.infer<typeof AddressListResponseSchema>;

/** 추가·수정 공용 요청 바디. */
export const SaveAddressRequestSchema = z.object({
  aliasType: AddressAliasTypeSchema.nullable(),
  customAlias: z.string().nullable(),
  zonecode: z.string().min(1),
  roadAddress: z.string().min(1),
  detailAddress: z.string().nullable(),
  recipient: z.string().min(1),
  phone: z.string().min(1),
  isDefault: z.boolean(),
});
export type SaveAddressRequest = z.infer<typeof SaveAddressRequestSchema>;

export const DeleteAddressResponseSchema = z.object({
  addressId: z.number().int().positive(),
});
export type DeleteAddressResponse = z.infer<typeof DeleteAddressResponseSchema>;
