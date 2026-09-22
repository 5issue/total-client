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
 * 뒤로가기는 이전 화면(홈 등 진입 지점)이 다양해 고정 링크가 아니라 `router.back()`
 * — `SectionHeader` 문서 주석이 안내하는 패턴 그대로. 검색 결과 뷰를 위한 별도 분기는
 * 두지 않는다: 검색 제출이 `/search?q=…` 를 히스토리에 push 하므로(#90,
 * `SearchPageContent` 주석 참고) 결과 화면에서의 `router.back()` 은 그 항목만 pop 해
 * 검색 탭 기본 화면으로 돌아간다 — 단말기 뒤로가기와 정확히 같은 동작이다.
 *
 * SearchBar 폭은 292px 고정(w-73) — Figma 인스턴스 실측(Dev Mode "Copy as CSS":
 * `width: 292px`, Fill 이 아니라 Fixed)으로 확인된 스펙이다.
 *
 * 뒤로가기 버튼과 검색창 사이 간격은 0px(디자인팀 스펙 갱신, #69) — `SectionHeader`
 * 의 center 슬롯 자체 좌측 패딩(`px-2`, 다른 화면에서도 쓰는 공용 스펙이라 그대로
 * 둔다)을 `-ml-2` 로 이 화면에서만 상쇄한다. 검색창 내부 아이콘의 8px 여백은
 * `SearchBar` 자체 padding 이라 영향받지 않는다.
 *
 * 키패드 ON 관련 디자인팀 협의(2026-09-10, #69): `autoFocus` 는 쓰지 않는다 — 모바일
 * 브라우저는 사용자 제스처 없이 키보드를 못 띄우는 데다, 마운트 시점에 포커스가 이미
 * 잡혀 있으면 첫 탭에서 focus 이벤트가 안 나 `isSearchInputFocused` 가 false 로 남는다.
 * 커스텀 "닫기" 버튼도 만들지 않는다 — iOS 키보드의 "완료" 가 포커스를 풀어준다.
 *
 * 포커스 상태는 로컬 state 가 아니라 `uiStore.isSearchInputFocused` 전역 플래그다 —
 * `BottomNav` 가 이 값을 읽어 포커스 중엔 스스로 숨는다(Figma 키패드 ON 목업엔 탭바가
 * 없다). unmount 시 반드시 false 로 되돌린다 — 스토어가 앱 전역 싱글턴이라 안 그러면
 * 다른 화면에서도 BottomNav 가 계속 숨는다.
 *
 * `onSearch`(제출) 시 최근 검색어에 기록하고 `onSubmit` 으로 부모에 알린다. 자동완성
 * 선택은 값만 채울 뿐 제출이 아니다 — 결과 뷰 전환은 제출 하나로 좁혀뒀다(#90).
 * 입력값은 부모(`SearchPageContent`)가 소유한 제어값이다 — 본문이 같은 값으로 기본
 * 콘텐츠/자동완성을 갈라 렌더해야 해서 형제끼리 값을 공유해야 한다.
 */
export interface SearchPageHeaderProps {
  value: string;
  onQueryChange: (value: string) => void;
  /** 검색창 Enter 제출 시 그 값으로 호출 — 결과 뷰 전환 트리거(#90). */
  onSubmit: (value: string) => void;
}

export function SearchPageHeader({ value, onQueryChange, onSubmit }: SearchPageHeaderProps) {
  const router = useRouter();
  const { setSearchInputFocused } = useUIStoreShallow((s) => ({
    setSearchInputFocused: s.setSearchInputFocused,
  }));
  const { addKeyword } = useRecentSearches();

  useEffect(() => {
    return () => setSearchInputFocused(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 언마운트 시 1회만
  }, []);

  const handleSearch = (submitted: string) => {
    addKeyword(submitted);
    onSubmit(submitted);
  };

  return (
    <SectionHeader
      leading="back"
      onLeadingClick={() => router.back()}
      // 디자인 QA(#132): 서치바와 하단 AI 식단 배너 사이 간격이 좁아보임 — 8px 이상
      // 확보. 헤더 기본 pb-1(4px)을 이 화면에서만 pb-2(8px)로 올린다. `!important` 로
      // 확정하는 이유는 SectionHeader 문서 주석 참고(같은 우선순위 클래스는 Tailwind
      // 생성 순서에 따라 뒤엉킨다).
      className="sticky top-0 z-10 pb-2!"
      center={
        <div className="-ml-2 w-73">
          <SearchBar
            label="검색어 입력"
            value={value}
            onChange={(e) => onQueryChange(e.target.value)}
            onClear={() => onQueryChange('')}
            onFocus={() => setSearchInputFocused(true)}
            onBlur={() => setSearchInputFocused(false)}
            onSearch={handleSearch}
          />
        </div>
      }
    />
  );
}
