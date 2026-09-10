/**
 * 마이컬리 화면 표시 모델. 퍼블리싱 단계라 서버 계약(Zod 스키마)이 아니라 화면용 타입만 둔다.
 * 데이터 연결 시 `types/address.ts` 의 스키마에서 파생하도록 교체.
 */

import type { AddressType } from '@/components/molecules/address/AddressChip';

/** 배송지 한 건 (화면 표시용). */
export interface AddressView {
  id: string;
  /** 배송지 유형칩 선택값(우리집/회사/직접입력). 목록엔 우리집·회사만 노출. */
  aliasType?: AddressType;
  /** `직접입력` 일 때 사용자가 적은 배송지 이름(편집 왕복용). */
  name?: string;
  /** 도로명 주소. */
  roadAddress: string;
  /** 상세주소(동/호 등). */
  detailAddress?: string;
  /** 우편번호(5자리). */
  zonecode: string;
  /** 받는 분. */
  recipient: string;
  /** 연락처. */
  phone: string;
  /** 배송 유형 라벨(예: "샛별배송"). 백엔드 없어 지금은 고정값. */
  deliveryType: string;
  /** 기본 배송지 여부. */
  isDefault: boolean;
}

/** `AddressSearchPanel` 이 저장(추가/수정)할 때 상위로 올리는 값 — `id` 는 컨테이너가 매긴다. */
export type AddressFormValues = Omit<AddressView, 'id'>;
