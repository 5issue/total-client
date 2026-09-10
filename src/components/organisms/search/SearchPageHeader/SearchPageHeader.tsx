'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { SearchBar } from '@/components/atoms/SearchBar';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useRecentSearches } from '@/hooks/search/useRecentSearches';
import { useUIStoreShallow } from '@/hooks/useUIStore';

/**
 * 검색 화면(`/search`) 상단 바 — 뒤로가기 + `SearchBar` (organism).
 * Figma "5팀 UI 공유용" node 577-13744(키패드 OFF) / node 577-13645(키패드 ON).
 *
 * `SectionHeader`(뒤로가기 프리셋 + center 커스텀 노드) 조합 그대로 재사용한다.
 * 뒤로가기는 이전 화면(홈 등 진입 지점)이 다양해 고정 링크가 아니라
 * `router.back()` — `SectionHeader` 문서 주석이 안내하는 패턴 그대로.
 * `SearchBar` 자체가 이미 클라이언트 컴포넌트라 이 조합은 어차피 클라 경계이므로,
 * 페이지 전체가 아니라 이 헤더 하나만 잎(leaf)으로 분리했다(code-style §8).
 *
 * SearchBar 폭은 292px 고정(w-73) — Figma 인스턴스 실측(get_metadata 절대좌표 +
 * Dev Mode "Copy as CSS": `width: 292px`, Fill 이 아니라 Fixed)으로 확인된 스펙이다.
 * `SectionHeader` 의 center 슬롯은 flex-1 이라 남는 공간이 있어도, 292px 로 고정된
 * 이 래퍼가 좌측에 붙고 나머지는 Figma 그대로 빈 여백으로 남는다.
 *
 * 키패드 ON 관련 디자인팀 협의 결론(2026-09-10, #69):
 * - `autoFocus` 로 포커스 시도 → 실제 키보드는 사용자가 입력창을 한 번 탭해야 뜨는
 *   것으로 확정(모바일 브라우저는 사용자 제스처 없이 키보드를 강제로 못 띄움 —
 *   네이티브 앱과 달리 웹은 이 권한이 없다, 플랫폼 제약이라 우회 불가).
 * - 키보드를 닫는 커스텀 "닫기" 버튼은 만들지 않는다 — iOS 자체 키보드 위 "완료(✓)"
 *   버튼으로 대체하기로 함. 그 버튼은 OS/브라우저가 자동으로 그려주고 탭하면 알아서
 *   포커스가 풀리므로(우리 `onBlur` 가 그대로 받는다) 별도 구현이 필요 없다.
 *
 * 포커스 상태는 로컬 state 가 아니라 `uiStore.isSearchInputFocused` 전역 플래그다 —
 * `organisms/shared/BottomNav` 가 이 값을 읽어 포커스 중엔 스스로 숨는다(Figma
 * 키패드 ON 목업엔 하단 탭바가 없다). unmount(화면 이탈) 시 반드시 false 로 되돌린다 —
 * 스토어가 앱 전역에서 살아있는 싱글턴이라 안 그러면 다른 화면에서도 BottomNav 가
 * 계속 숨는다.
 *
 * `sticky top-0`(+ `z-10`) — 스크롤 중에도 검색창이 상단에 계속 보이도록 하는
 * UX 개선. ⚠️ 스크롤 중 BottomNav 가 다시 나타나는 현상과는 무관하다 — 실기기
 * 디버그로 확인한 원인은 "입력창이 화면 밖으로 나가서"가 아니라, 스크롤하려고
 * 다른 요소(급상승 검색어 등)를 터치하는 순간 iOS Safari 가 그 터치 자체로 포커스를
 * 풀어버리는 것(정상 동작)이었다 — sticky 여부와 무관하게 항상 일어난다. 키보드가
 * 닫히면 `isSearchInputFocused` 가 false 가 되어 BottomNav 가 다시 보이는 것은
 * 의도된 흐름(키패드 ON 전용 레이아웃은 키보드가 실제로 떠 있을 때만 적용).
 *
 * `onSearch`(Enter) 시 `useRecentSearches().addKeyword` 로 최근 검색어에 기록한다
 * — `organisms/search/RecentSearchesSection` 이 같은 훅을 구독해 화면에 반영한다.
 *
 * 입력값은 이 컴포넌트의 로컬 state 가 아니라 부모(`SearchPageContent`)가 소유한
 * 제어값이다 — 본문이 입력값 유무로 기본 콘텐츠/자동완성 드롭다운을 갈라 렌더해야
 * 해서, 형제 컴포넌트가 같은 값을 읽어야 한다(#69 자동완성 드롭다운).
 */
export interface SearchPageHeaderProps {
  value: string;
  onQueryChange: (value: string) => void;
}

export function SearchPageHeader({ value, onQueryChange }: SearchPageHeaderProps) {
  const router = useRouter();
  const { setSearchInputFocused } = useUIStoreShallow((s) => ({
    setSearchInputFocused: s.setSearchInputFocused,
  }));
  const { addKeyword } = useRecentSearches();

  useEffect(() => {
    return () => setSearchInputFocused(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 언마운트 시 1회만
  }, []);

  return (
    <SectionHeader
      leading="back"
      onLeadingClick={() => router.back()}
      className="sticky top-0 z-10"
      center={
        <div className="w-73">
          <SearchBar
            label="검색어 입력"
            autoFocus
            value={value}
            onChange={(e) => onQueryChange(e.target.value)}
            onClear={() => onQueryChange('')}
            onFocus={() => setSearchInputFocused(true)}
            onBlur={() => setSearchInputFocused(false)}
            onSearch={addKeyword}
          />
        </div>
      }
    />
  );
}
