import { describe, expect, it } from 'vitest';

import { AddCartItemsRequestSchema, CartAddressSchema } from './cart';

describe('AddCartItemsRequestSchema', () => {
  it('items가 1건 이상이고 productId/quantity가 양의 정수면 통과한다', () => {
    const result = AddCartItemsRequestSchema.safeParse({
      items: [{ productId: 303, quantity: 2 }],
    });
    expect(result.success).toBe(true);
  });

  it('items가 빈 배열이면 거부한다', () => {
    const result = AddCartItemsRequestSchema.safeParse({ items: [] });
    expect(result.success).toBe(false);
  });

  it('quantity가 0 이하면 거부한다', () => {
    const result = AddCartItemsRequestSchema.safeParse({
      items: [{ productId: 303, quantity: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it('productId가 GROUP처럼 0/음수면 거부한다 — 반드시 실제 UNIT id여야 한다', () => {
    const result = AddCartItemsRequestSchema.safeParse({
      items: [{ productId: 0, quantity: 1 }],
    });
    expect(result.success).toBe(false);
  });

  it('여러 상품을 한 번에 담을 수 있다', () => {
    const result = AddCartItemsRequestSchema.safeParse({
      items: [
        { productId: 303, quantity: 1 },
        { productId: 305, quantity: 2 },
      ],
    });
    expect(result.success).toBe(true);
  });
});

const baseAddress = {
  addressId: 1,
  addressName: '우리집',
  recipientName: '조성민',
  recipientPhone: '01012345678',
  zipCode: '06236',
  address: '서울 강남구 테헤란로 123',
  detailAddress: null,
};

describe('CartAddressSchema', () => {
  it('zipCode가 null이어도 통과한다 — 배송지 변경 응답이 항상 null로 내려온다(실 백엔드 확인, 회귀 테스트)', () => {
    const result = CartAddressSchema.safeParse({ ...baseAddress, zipCode: null });
    expect(result.success).toBe(true);
  });

  it('zipCode가 문자열이어도 통과한다', () => {
    const result = CartAddressSchema.safeParse(baseAddress);
    expect(result.success).toBe(true);
  });
});
