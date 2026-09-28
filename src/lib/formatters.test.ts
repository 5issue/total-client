import { describe, expect, it } from 'vitest';

import { formatPrice } from './formatters';

// formatDDayLabel/formatExpiryLabel은 dew2314님이 #139에서 추가한 함수라 여기서
// 테스트하지 않는다(seongmin36이 구현한 부분만 테스트).
describe('formatPrice', () => {
  it('천 단위 콤마와 원 단위를 붙인다', () => {
    expect(formatPrice(47000)).toBe('47,000원');
  });

  it('소수점은 반올림한다', () => {
    expect(formatPrice(999.6)).toBe('1,000원');
  });
});
