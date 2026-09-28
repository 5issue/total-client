import { describe, expect, it } from 'vitest';

import type { Address } from '@/types/address';

import { mapAddressToView, mapFormValuesToSaveRequest } from './mapAddressResponse';
import type { AddressFormValues } from '../model';

function makeAddress(overrides: Partial<Address> = {}): Address {
  return {
    addressId: 1,
    addressName: '우리집',
    recipientName: '조성민',
    phone: '01012345678',
    zipCode: '06236',
    address: '서울 강남구 테헤란로 123',
    addressDetail: null,
    isDefault: true,
    accessMethod: null,
    ...overrides,
  };
}

describe('mapAddressToView', () => {
  it('addressName이 "우리집"이면 aliasType을 home으로 판정한다', () => {
    const result = mapAddressToView(makeAddress({ addressName: '우리집' }));
    expect(result.aliasType).toBe('home');
    expect(result.name).toBeUndefined();
  });

  it('addressName이 "회사"면 aliasType을 company로 판정한다', () => {
    const result = mapAddressToView(makeAddress({ addressName: '회사' }));
    expect(result.aliasType).toBe('company');
  });

  it('그 외 이름은 custom으로 판정하고 name에 원문을 담는다', () => {
    const result = mapAddressToView(makeAddress({ addressName: '부모님댁' }));
    expect(result.aliasType).toBe('custom');
    expect(result.name).toBe('부모님댁');
  });
});

describe('mapFormValuesToSaveRequest', () => {
  const baseValues: AddressFormValues = {
    aliasType: 'custom',
    name: '부모님댁',
    roadAddress: '서울 강남구 테헤란로 123',
    detailAddress: '101동 101호',
    zonecode: '06236',
    recipient: '조성민',
    phone: '01012345678',
    deliveryType: '샛별배송',
    isDefault: false,
  };

  it('aliasType이 home이면 addressName을 "우리집" 고정 문자열로 되돌린다', () => {
    const result = mapFormValuesToSaveRequest({ ...baseValues, aliasType: 'home' });
    expect(result.addressName).toBe('우리집');
  });

  it('aliasType이 custom이면 name을 그대로 addressName으로 쓴다', () => {
    const result = mapFormValuesToSaveRequest(baseValues);
    expect(result.addressName).toBe('부모님댁');
  });

  it('custom인데 name이 비어 있으면 "배송지" 기본값을 쓴다', () => {
    const result = mapFormValuesToSaveRequest({ ...baseValues, name: undefined });
    expect(result.addressName).toBe('배송지');
  });
});
