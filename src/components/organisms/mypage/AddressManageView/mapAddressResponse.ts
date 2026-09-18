import type { AddressType } from '@/components/molecules/address/AddressChip';
import type { Address, AddressAliasType, SaveAddressRequest } from '@/types/address';

import type { AddressFormValues, AddressView } from '../model';

const ALIAS_TO_VIEW: Record<AddressAliasType, AddressType> = {
  HOME: 'home',
  COMPANY: 'company',
};

const ALIAS_TO_SERVER: Partial<Record<AddressType, AddressAliasType>> = {
  home: 'HOME',
  company: 'COMPANY',
};

export function mapAddressToView(address: Address): AddressView {
  return {
    id: String(address.addressId),
    aliasType: address.aliasType
      ? ALIAS_TO_VIEW[address.aliasType]
      : address.customAlias
        ? 'custom'
        : undefined,
    name: address.customAlias ?? undefined,
    roadAddress: address.roadAddress,
    detailAddress: address.detailAddress ?? undefined,
    zonecode: address.zonecode,
    recipient: address.recipient,
    phone: address.phone,
    deliveryType: address.deliveryType,
    isDefault: address.isDefault,
  };
}

/** `AddressSearchPanel` 이 올리는 폼 값 → 저장 요청 바디. `deliveryType` 은 서버가 판정 — 안 보낸다. */
export function mapFormValuesToSaveRequest(values: AddressFormValues): SaveAddressRequest {
  return {
    aliasType: values.aliasType ? (ALIAS_TO_SERVER[values.aliasType] ?? null) : null,
    customAlias: values.aliasType === 'custom' ? (values.name ?? null) : null,
    zonecode: values.zonecode,
    roadAddress: values.roadAddress,
    detailAddress: values.detailAddress ?? null,
    recipient: values.recipient,
    phone: values.phone,
    isDefault: values.isDefault,
  };
}
