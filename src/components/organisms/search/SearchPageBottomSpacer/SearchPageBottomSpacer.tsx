'use client';

import { useUIStore } from '@/hooks/useUIStore';

/**
 * 검색 화면 맨 아래(급상승 검색어 다음) 여백 — Figma node 577-13822
 * "검색 화면 / 스크롤 이동 및 키패드 재활성화".
 *
 * - 키패드 OFF: 급상승 검색어 다음에 80px 추가 여백.
 * - 키패드 ON: 40px 고정 여백.
 *
 * ⚠️ 키보드 높이를 더할 필요가 없다 — "끝까지 스크롤했을 때 키보드와 40px 간격"
 * 은 브라우저의 최대 스크롤 위치 계산(documentHeight - visualViewport.height)
 * 에 키보드로 줄어든 뷰포트가 이미 반영되기 때문에, 스페이서를 그냥 고정 40px로만
 * 둬도 스크롤을 끝까지 올렸을 때 자동으로 그 간격이 나온다. 처음에
 * `키보드높이 + 40`으로 만들었다가 실기기에서 간격이 수백px로 부풀어 보이는
 * 버그가 나서(이중 계산) 수정했다 — `useKeyboardInset` 은 더 이상 필요 없다.
 *
 * `(shop)/layout.tsx` 의 `<main>` 이 모든 shop 화면에 공용으로
 * `pb-bottom-nav-safe`(112px)를 이미 깔아둔다 — 부모 요소의 padding이라 자식(이
 * 컴포넌트)의 margin으로는 상쇄가 불가능하다(레이아웃상 시도해봤지만 실제로는
 * 적용되지 않는 걸 확인했다). 그래서 여기 적은 80px/40px는 그 공용 112px **위에
 * 추가로 더하는** 여백으로 구현한다.
 */
export function SearchPageBottomSpacer() {
  const isFocused = useUIStore((s) => s.isSearchInputFocused);

  return <div aria-hidden style={{ height: isFocused ? 40 : 80 }} />;
}
