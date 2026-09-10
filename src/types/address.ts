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

export const AddressFormSchema = z.object({
  /** 카카오 우편번호 위젯 결과 — 사용자가 직접 편집하지 않는다. */
  zonecode: z.string().min(1),
  roadAddress: z.string().min(1),
  /** 상세주소(동/호 등). 선택. */
  detailAddress: z.string(),
  /** 유형칩 선택값. 미선택 가능. */
  aliasType: z.enum(['home', 'company', 'custom']).optional(),
  /** `직접입력` 일 때의 배송지 이름. 그 외 상태에선 무시. */
  customAlias: z.string(),
  recipient: z.string().trim().min(1, '받으실 분을 입력해주세요'),
  phone: z
    .string()
    .refine((v) => PHONE_DIGITS_REGEX.test(toDigits(v)), '올바른 휴대폰 번호를 입력해주세요'),
  /** 수정 화면에서 "기본 배송지로 저장" 토글. */
  saveAsDefault: z.boolean(),
});

export type AddressFormFields = z.infer<typeof AddressFormSchema>;

/** 폼이 검증을 통과한 값에서 저장용 값을 뽑을 때 쓰는 정규화 헬퍼. */
export const normalizePhone = toDigits;
