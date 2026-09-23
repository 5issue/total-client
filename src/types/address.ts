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

// ── 서버 계약 (데이터 연동, 2026-09-22 user-service `UserController` 기준 재확인) ──────
//
// - GET  /api/v1/users/me/addresses                 배송지 목록 조회
// - POST /api/v1/users/me/addresses                 배송지 추가
// - PATCH /api/v1/users/me/addresses/{id}/default   기본 배송지 설정
//
// ⚠️ PUT/DELETE 단건 수정·삭제는 백엔드에 엔드포인트 자체가 없다(2026-09-22 확인) — 이슈 #119
// 설계 당시 문서(`/api/v1/addresses`, aliasType enum, deliveryType 응답값 포함)와 실제 구현이
// 갈라져 있다. `aliasType`/`customAlias` 서버 필드도 없다 — 백엔드는 `addressName` 자유
// 텍스트 하나뿐이라, '우리집'/'회사' 정확히 일치하는 문자열로 왕복한다(AddressListItem 의
// `PLACE_CHIP` 라벨과 동일 — mapAddressResponse.ts). `deliveryType` 응답 필드도 없다 —
// 프로젝트 전역 관례대로 '샛별배송' 고정값(organisms/mypage/model.ts 참고).
// [addressId]/route.ts 의 PUT/DELETE 는 그대로 두되 이 문서를 참조하게 주석 처리했다.

export const AddressSchema = z.object({
  addressId: z.number().int().positive(),
  addressName: z.string().min(1),
  recipientName: z.string().min(1),
  phone: z.string().min(1),
  zipCode: z.string().min(1),
  address: z.string().min(1),
  addressDetail: z.string().nullable(),
  isDefault: z.boolean(),
  /** 공동현관 출입방법 등 — 체크아웃 배송 상세정보(DeliveryDetailStore)와는 별개 개념. */
  accessMethod: z.string().nullable(),
});
export type Address = z.infer<typeof AddressSchema>;

export const AddressListResponseSchema = z.object({
  addresses: z.array(AddressSchema),
});
export type AddressListResponse = z.infer<typeof AddressListResponseSchema>;

/** 배송지 추가 요청 바디 — 백엔드 `CreateAddressRequest` 그대로. */
export const SaveAddressRequestSchema = z.object({
  addressName: z.string().min(1).max(50),
  recipientName: z.string().min(1).max(50),
  phone: z.string().min(1),
  zipCode: z.string().min(1),
  address: z.string().min(1).max(255),
  addressDetail: z.string().max(255).nullable(),
  isDefault: z.boolean(),
  accessMethod: z.string().max(255).nullable(),
});
export type SaveAddressRequest = z.infer<typeof SaveAddressRequestSchema>;

/** 배송지 추가 응답 — 백엔드가 전체 Address 가 아니라 이 확인 객체만 돌려준다. */
export const CreateAddressResponseSchema = z.object({
  addressId: z.number().int().positive(),
  success: z.boolean(),
});
export type CreateAddressResponse = z.infer<typeof CreateAddressResponseSchema>;

/** 단건 삭제 응답 — 백엔드에 삭제 엔드포인트가 아직 없어 사용되지 않는다(위 계약 노트 참고). */
export const DeleteAddressResponseSchema = z.object({
  addressId: z.number().int().positive(),
});
export type DeleteAddressResponse = z.infer<typeof DeleteAddressResponseSchema>;
