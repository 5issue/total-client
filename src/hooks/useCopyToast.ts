'use client';

import { useEffect, useState } from 'react';

/**
 * 클립보드 복사 성공 시 토스트를 보여주는 공용 훅.
 * `OrderCompleteView`·`OrderDetailView` 양쪽에서 같은 로직(복사 → 토스트 → 자동 소멸)을
 * 쓰게 되어 분리했다 — 두 화면 다 렌더 위치(고정 CTA 바 위 vs 화면 하단 고정)는 다르므로
 * `visible` 만 반환하고 `<Toast>` 배치는 호출부가 정한다.
 *
 * 값 복사에 성공했을 때만 `visible` 을 켠다 — 권한 거부·비보안 컨텍스트 등으로 실패했는데
 * "복사했어요" 를 보여주면 거짓말이 되므로 조용히 무시한다.
 *
 * 토스트가 떠 있는 동안 다시 복사해도 노출 시간이 리셋되도록 boolean 이 아니라 카운터로
 * 관리한다(같은 `true` 값으로는 effect 의존성이 안 바뀌어 타이머가 재설정되지 않는다).
 */
const TOAST_DURATION_MS = 3000;

export function useCopyToast() {
  const [seq, setSeq] = useState(0);

  useEffect(() => {
    if (seq === 0) return;
    const timer = setTimeout(() => setSeq(0), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [seq]);

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setSeq((s) => s + 1);
    } catch {
      // 클립보드 권한 거부·비보안 컨텍스트 등 — 실패했는데 토스트를 띄우면 거짓말이 된다.
    }
  }

  return { visible: seq > 0, copy };
}
