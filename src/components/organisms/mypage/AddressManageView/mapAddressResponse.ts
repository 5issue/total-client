import type { Address, SaveAddressRequest } from '@/types/address';

import type { AddressFormValues, AddressView } from '../model';

// 백엔드(user-service)엔 aliasType enum 이 없다 — `addressName` 자유 텍스트 하나뿐이라,
// AddressListItem 의 `PLACE_CHIP`/AddressSearchPanel 의 `ALIAS_LABEL` 과 똑같은 문자열로
// 왕복시켜서 유형칩을 흉내낸다(types/address.ts 계약 노트 참고).
const HOME_LABEL = '우리집';
const COMPANY_LABEL = '회사';

// 백엔드에 배송유형 판정이 없어 프로젝트 전역 관례대로 고정값(organisms/mypage/model.ts 참고).
const FIXED_DELIVERY_TYPE = '샛별배송';

export function mapAddressToView(address: Address): AddressView {
  const aliasType =
    address.addressName === HOME_LABEL
      ? 'home'
      : address.addressName === COMPANY_LABEL
        ? 'company'
        : 'custom';

  return {
    id: String(address.addressId),
    aliasType,
    name: aliasType === 'custom' ? address.addressName : undefined,
    roadAddress: address.address,
    detailAddress: address.addressDetail ?? undefined,
    zonecode: address.zipCode,
    recipient: address.recipientName,
    phone: address.phone,
    deliveryType: FIXED_DELIVERY_TYPE,
    isDefault: address.isDefault,
  };
}

/** `AddressSearchPanel` 이 올리는 폼 값 → 저장 요청 바디. `deliveryType` 은 서버가 안 받는다(위 노트). */
export function mapFormValuesToSaveRequest(values: AddressFormValues): SaveAddressRequest {
  const addressName =
    values.aliasType === 'home'
      ? HOME_LABEL
      : values.aliasType === 'company'
        ? COMPANY_LABEL
        : values.name?.trim() || '배송지';

  return {
    addressName,
    recipientName: values.recipient,
    phone: values.phone,
    zipCode: values.zonecode,
    address: values.roadAddress,
    addressDetail: values.detailAddress ?? null,
    isDefault: values.isDefault,
    accessMethod: null,
  };
}
