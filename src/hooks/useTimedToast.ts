'use client';

import { useEffect, useState } from 'react';

/**
 * 트리거 시 잠깐 보였다 지정한 시간 뒤 자동으로 사라지는 토스트의 표시 여부를 관리하는
 * 공용 훅. 노출 시간이 호출부마다 다르다(주문 내역 "다시 담기" 토스트는 2초).
 *
 * 토스트가 떠 있는 동안 다시 트리거해도 노출 시간이 리셋되도록 boolean 이 아니라
 * 카운터로 관리한다(같은 `true` 값으로는 effect 의존성이 안 바뀌어 타이머가 재설정되지
 * 않는다).
 */
export function useTimedToast(durationMs: number) {
  const [seq, setSeq] = useState(0);

  useEffect(() => {
    if (seq === 0) return;
    const timer = setTimeout(() => setSeq(0), durationMs);
    return () => clearTimeout(timer);
  }, [seq, durationMs]);

  return { visible: seq > 0, trigger: () => setSeq((s) => s + 1) };
}
