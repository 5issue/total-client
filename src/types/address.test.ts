import { describe, expect, it } from 'vitest';

import { AddressDetailFormSchema, AddressFormSchema, PHONE_DIGITS_REGEX } from './address';

const baseFields = {
  zonecode: '06236',
  roadAddress: '서울 강남구 테헤란로 123',
  detailAddress: '',
  aliasType: undefined,
  customAlias: '',
  recipient: '조성민',
  phone: '010-1234-5678',
  saveAsDefault: false,
};

describe('AddressFormSchema', () => {
  it('"직접입력" 유형에서 "우리집"/"회사"를 이름으로 쓰면 거부한다', () => {
    const result = AddressFormSchema.safeParse({
      ...baseFields,
      aliasType: 'custom',
      customAlias: '우리집',
    });
    expect(result.success).toBe(false);
  });

  it('"직접입력" 유형에서 공백만 있는 이름은 거부한다', () => {
    const result = AddressFormSchema.safeParse({
      ...baseFields,
      aliasType: 'custom',
      customAlias: '   ',
    });
    expect(result.success).toBe(false);
  });

  it('"직접입력" 유형에서 일반 이름은 통과한다', () => {
    const result = AddressFormSchema.safeParse({
      ...baseFields,
      aliasType: 'custom',
      customAlias: '부모님댁',
    });
    expect(result.success).toBe(true);
  });

  it('유효하지 않은 휴대폰 번호는 거부한다', () => {
    const result = AddressFormSchema.safeParse({ ...baseFields, phone: '02-1234-5678' });
    expect(result.success).toBe(false);
  });
});

describe('AddressDetailFormSchema', () => {
  it('recipient/phone 없이도 통과한다(추가 폼은 로그인 사용자 정보로 자동 채움)', () => {
    const { recipient: _recipient, phone: _phone, ...rest } = baseFields;
    const result = AddressDetailFormSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it('"직접입력" 유형에서 "회사"를 이름으로 쓰면 여전히 거부한다', () => {
    const { recipient: _recipient, phone: _phone, ...rest } = baseFields;
    const result = AddressDetailFormSchema.safeParse({
      ...rest,
      aliasType: 'custom',
      customAlias: '회사',
    });
    expect(result.success).toBe(false);
  });
});

describe('PHONE_DIGITS_REGEX', () => {
  it('010~019 국내 휴대폰 번호(7~8자리)를 허용한다', () => {
    expect(PHONE_DIGITS_REGEX.test('01012345678')).toBe(true);
    expect(PHONE_DIGITS_REGEX.test('01712345678')).toBe(true);
  });

  it('유선전화나 자리수가 안 맞는 번호는 거부한다', () => {
    expect(PHONE_DIGITS_REGEX.test('0212345678')).toBe(false);
    expect(PHONE_DIGITS_REGEX.test('0101234')).toBe(false);
  });
});
