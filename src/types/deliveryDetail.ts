import { z } from 'zod';

import { PHONE_DIGITS_REGEX } from './address';

/**
 * '배송 상세 정보 수정' 화면 폼 스키마 (화면 폼 검증용) — Figma node 666-26216.
 * 백엔드 계약이 아니라 `DeliveryDetailEditView` 가 `zodResolver` 로 쓰는 스키마다 —
 * code-style-convention §4(수동 useState 폼 금지, 스키마는 types/ 에).
 */
const toDigits = (value: string) => value.replace(/[^0-9]/g, '');

export const DeliveryDetailFormSchema = z.object({
  /** 받으실 분. Figma 는 로그인 사용자 이름으로 채워진 채 시작(수정 가능). */
  receiverName: z.string().trim().min(1, '받으실 분을 입력해주세요'),
  phone: z
    .string()
    .refine((v) => PHONE_DIGITS_REGEX.test(toDigits(v)), '올바른 휴대폰 번호를 입력해주세요'),
  /** 받으실 장소. 기본값 '문 앞'(node 666-26236, 선택 상태). */
  location: z.enum(['front-door', 'other']),
  /** '기타 장소' 선택 시에만 의미 있음(그 외엔 아래 refine 이 검사하지 않는다). */
  otherLocationType: z.enum(['etc', 'locker', 'entrance']).optional(),
  /** '기타' 선택 시 나오는 자유 서술. '택배 수령실' 과 별개 필드 — 라디오를 오갈 때 서로의
   * 입력값이 섞이면 안 된다(사용자 확인, 2026-09-14). 선택 입력(피드백 컨벤션: 자유 서술
   * 필드는 비워도 저장 가능하게 두는 게 이 프로젝트의 최근 결정과 일관된다). */
  etcLocationDetail: z.string(),
  /** '택배 수령실' 선택 시 나오는 자유 서술. `etcLocationDetail` 참고. */
  lockerLocationDetail: z.string(),
  /** 배송 완료 후 메시지 전송 시점. 기본값 '배송 직후'(node 666-26255, 선택 상태). */
  messageTiming: z.enum(['immediately', 'seven-am']),
});

export type DeliveryDetailFormFields = z.infer<typeof DeliveryDetailFormSchema>;
