import { describe, expect, it } from 'vitest';

import { CheckoutOrderItemSchema } from './order';

const baseItem = {
  orderItemId: 1,
  productId: 103,
  skuId: 303,
  title: '한우 1++ 안심 300g',
  quantity: 1,
  unitPrice: 47000,
  totalPrice: 47000,
};

describe('CheckoutOrderItemSchema', () => {
  it('skuId가 0이어도 통과한다 — SKU 미배정 상품은 0으로 내려온다(실 백엔드 확인, 회귀 테스트)', () => {
    const result = CheckoutOrderItemSchema.safeParse({ ...baseItem, skuId: 0 });
    expect(result.success).toBe(true);
  });

  it('skuId가 양수여도 통과한다', () => {
    const result = CheckoutOrderItemSchema.safeParse(baseItem);
    expect(result.success).toBe(true);
  });

  it('skuId가 음수면 거부한다', () => {
    const result = CheckoutOrderItemSchema.safeParse({ ...baseItem, skuId: -1 });
    expect(result.success).toBe(false);
  });
});
