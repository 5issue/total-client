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
 *
 * SearchBar 폭은 292px 고정(w-73) — Figma 인스턴스 실측(Dev Mode "Copy as CSS":
 * `width: 292px`, Fill 이 아니라 Fixed)으로 확인된 스펙이다.
 *
 * 뒤로가기 버튼과 검색창 사이 간격은 0px(디자인팀 스펙 갱신, #69) — `SectionHeader`
 * 의 center 슬롯 자체 좌측 패딩(`px-2`, 다른 화면에서도 쓰는 공용 스펙이라 그대로
 * 둔다)을 `-ml-2` 로 이 화면에서만 상쇄한다. 검색창 내부 아이콘의 8px 여백은
 * `SearchBar` 자체 padding 이라 영향받지 않는다.
 *
 * 키패드 ON 관련 디자인팀 협의(2026-09-10, #69):
 * - `autoFocus` 는 쓰지 않는다. 모바일 브라우저는 사용자 제스처 없이 키보드를 못
 *   띄우는 데다, autoFocus 로 마운트 시점에 DOM 포커스가 이미 잡혀 있으면 사용자의
 *   첫 탭이 "이미 포커스된 요소를 다시 클릭"하는 셈이라 새 focus 이벤트가 안 나고
 *   `isSearchInputFocused` 가 계속 false 로 남는다(하단 탭바가 숨지 않는 버그로 재현).
 * - 커스텀 "닫기" 버튼은 만들지 않는다 — iOS 자체 키보드 위 "완료(✓)" 버튼이 탭하면
 *   알아서 포커스를 풀어주므로(우리 `onBlur` 가 그대로 받는다) 별도 구현이 필요 없다.
 *
 * 포커스 상태는 로컬 state 가 아니라 `uiStore.isSearchInputFocused` 전역 플래그다 —
 * `organisms/shared/BottomNav` 가 이 값을 읽어 포커스 중엔 스스로 숨는다(Figma 키패드
 * ON 목업엔 하단 탭바가 없다). unmount(화면 이탈) 시 반드시 false 로 되돌린다 —
 * 스토어가 앱 전역 싱글턴이라 안 그러면 다른 화면에서도 BottomNav 가 계속 숨는다.
 *
 * `sticky top-0`(+ `z-10`) — 스크롤 중에도 검색창이 상단에 계속 보이게 하는 UX
 * 개선. 스크롤 중 BottomNav 가 다시 나타나는 현상과는 무관하다 — 스크롤하려고 다른
 * 요소를 터치하는 순간 iOS Safari 가 그 터치 자체로 입력 포커스를 풀어버리는 것이
 * 원인이며(정상 동작), 키보드가 닫히면 하단 탭바가 다시 보이는 건 의도된 흐름이다.
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
        <div className="-ml-2 w-73">
          <SearchBar
            label="검색어 입력"
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
