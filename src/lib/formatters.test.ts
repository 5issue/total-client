import { describe, expect, it } from 'vitest';

import { formatDDayLabel, formatExpiryLabel, formatPrice } from './formatters';

describe('formatPrice', () => {
  it('천 단위 콤마와 원 단위를 붙인다', () => {
    expect(formatPrice(47000)).toBe('47,000원');
  });

  it('소수점은 반올림한다', () => {
    expect(formatPrice(999.6)).toBe('1,000원');
  });
});

describe('formatDDayLabel', () => {
  const today = new Date('2026-09-28T15:00:00+09:00');

  it('오늘이 만료일이면 D-day를 반환한다', () => {
    expect(formatDDayLabel('2026-09-28T09:00:00+09:00', today)).toBe('D-day');
  });

  it('미래 날짜는 D-N을 반환한다(자정 기준, 시각은 무시)', () => {
    expect(formatDDayLabel('2026-09-30T23:59:00+09:00', today)).toBe('D-2');
  });

  it('과거 날짜는 D+N을 반환한다', () => {
    expect(formatDDayLabel('2026-09-25T00:00:00+09:00', today)).toBe('D+3');
  });
});

describe('formatExpiryLabel', () => {
  it('"MM.DD(요일)까지" 형식으로 포맷한다', () => {
    expect(formatExpiryLabel('2026-09-30T00:00:00+09:00')).toBe('09.30(수)까지');
  });
});
