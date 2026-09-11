'use client';

import { useUIStore } from '@/hooks/useUIStore';

/**
 * 검색 화면 맨 아래(급상승 검색어 다음) 여백 — Figma node 577-13822.
 * 키패드 OFF 80px / ON 40px. `(shop)/layout.tsx`의 `pb-bottom-nav-safe`(112px) 위에
 * 추가로 쌓이는 여백이다(부모 padding이라 자식 margin으로 상쇄 불가).
 *
 * 키보드 높이를 별도로 더하지 않는다 — 브라우저의 최대 스크롤 위치 계산에 키보드로
 * 줄어든 뷰포트가 이미 반영되므로, 고정값만으로 스크롤 끝에서 정확한 간격이 나온다.
 */
export function SearchPageBottomSpacer() {
  const isFocused = useUIStore((s) => s.isSearchInputFocused);

  return <div aria-hidden className={isFocused ? 'h-10' : 'h-20'} />;
}
