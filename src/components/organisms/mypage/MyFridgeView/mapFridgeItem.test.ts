import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { FridgeStockItem } from '@/types/fridge';

import { toFridgeItemViewModel } from './mapFridgeItem';

function makeApiItem(overrides: Partial<FridgeStockItem> = {}): FridgeStockItem {
  return {
    product: { product_id: '103', name: '한우 1++ 안심 300g', storage_type: 'FROZEN' },
    ingredients: [],
    quantity: 1,
    unit: '개',
    expires_at: '2026-09-30T00:00:00+09:00',
    is_expired: false,
    ...overrides,
  };
}

describe('toFridgeItemViewModel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-28T12:00:00+09:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('만료 3일 이내면 stored + expiring 필터를 함께 부여한다', () => {
    const result = toFridgeItemViewModel(makeApiItem({ expires_at: '2026-09-30T00:00:00+09:00' }), 0);
    expect(result.dDayLabel).toBe('D-2');
    expect(result.filters).toEqual(['stored', 'expiring']);
  });

  it('만료까지 4일 이상이면 stored 필터만 부여한다', () => {
    const result = toFridgeItemViewModel(makeApiItem({ expires_at: '2026-10-05T00:00:00+09:00' }), 0);
    expect(result.filters).toEqual(['stored']);
  });

  it('is_expired가 true면 필터는 expired만 남는다(D-day와 무관)', () => {
    const result = toFridgeItemViewModel(
      makeApiItem({ is_expired: true, expires_at: '2026-10-05T00:00:00+09:00' }),
      0,
    );
    expect(result.filters).toEqual(['expired']);
  });

  it('expires_at이 없으면 "유통기한 없음"으로 표시하고 mock 유통기한을 물려받지 않는다', () => {
    const result = toFridgeItemViewModel(makeApiItem({ expires_at: null }), 0);
    expect(result.expiryLabel).toBe('유통기한 없음');
  });

  it('storage_type에 냉동/frozen이 없으면 refrigerated로 분류한다', () => {
    const result = toFridgeItemViewModel(makeApiItem({ product: { ...makeApiItem().product, storage_type: 'COLD' } }), 0);
    expect(result.storageType).toBe('refrigerated');
  });

  it('quantity/unit을 그대로 이어붙여 수량 라벨을 만든다', () => {
    const result = toFridgeItemViewModel(makeApiItem({ quantity: 3, unit: '개' }), 0);
    expect(result.quantityLabel).toBe('3개');
  });
});
