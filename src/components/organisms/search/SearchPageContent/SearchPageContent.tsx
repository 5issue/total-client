'use client';

import { useState, type ReactNode } from 'react';

import { useRouter } from 'next/navigation';

import { SearchPageBottomSpacer } from '@/components/organisms/search/SearchPageBottomSpacer';
import { SearchPageHeader } from '@/components/organisms/search/SearchPageHeader';
import { SearchResultSection } from '@/components/organisms/search/SearchResultSection';
import { SearchSuggestionsSection } from '@/components/organisms/search/SearchSuggestionsSection';

export interface SearchPageContentProps {
  /**
   * 검색어가 비어있을 때 보여줄 기본 콘텐츠(최근/추천/급상승 검색어 등). 이
   * 컴포넌트가 직접 import 하지 않고 `page.tsx`(RSC)에서 조합해 prop 으로 받는다 —
   * 그 섹션들은 상태·브라우저 API 가 필요 없는 정적 콘텐츠라, 여기서 직접
   * import 하면 이 파일의 `'use client'` 경계에 딸려 들어가 클라이언트 번들에
   * 불필요하게 포함된다(code-style §1·§8, RSC 기본). `RecentSearchesSection` 처럼
   * 그 중 실제로 클라이언트가 필요한 섹션은 자기 파일에 `'use client'` 를 갖고
   * 있으니 RSC 인 `page.tsx` 가 그대로 렌더해도 문제없다 — 서버 컴포넌트가
   * 클라이언트 컴포넌트를 자식으로 렌더하는 건 항상 가능하다.
   */
  defaultContent: ReactNode;
  /** URL `?q=` 값 — 제출된 검색어. `page.tsx`(RSC)가 `searchParams` 에서 읽어 넘긴다. */
  urlQuery: string;
}

/**
 * `/search` 화면 본문 오케스트레이터 (organism).
 *
 * **제출된 검색어는 URL(`?q=`)이 소유한다(#90).** 결과 뷰가 순수 리액트 state 면 URL 이
 * `/search` 그대로라 결과 화면에서 단말기/브라우저 뒤로가기를 누를 때 `/search` 자체를
 * 떠나 홈으로 나가버린다 — 헤더 버튼만 특별 처리해도 시스템 제스처는 그대로 샌다.
 * 제출 시 `router.push` 로 히스토리 항목을 쌓으면 어느 쪽이든 그 항목만 pop 돼 검색 탭
 * 기본 화면으로 돌아오고, 결과 화면이 공유 가능한 URL 도 갖는다. 단 항목은 하나만
 * 유지한다 — 결과 화면에서의 재검색은 `replace` 다(`handleSubmit` 주석 참고).
 *
 * 화면 상태는 두 개의 로컬 state 로 가른다:
 * - `barValue` — 검색창에 떠 있는 글자. 타이핑마다 갱신된다.
 * - `viewQuery` — 결과 뷰가 쓸 검색어(비면 결과를 안 그린다). URL 의 `?q=` 를 따라가되
 *   제출 직후엔 낙관적으로 먼저 채운다 — `router.push` 반영까지 한 프레임 동안 결과
 *   대신 자동완성이 깜빡이는 걸 막기 위함이다.
 *
 * URL 이 바뀌면(제출 반영 / 뒤로·앞으로가기 / 하단탭 재진입) 렌더 중에 두 값을 URL 값으로
 * 되돌린다 — `useEffect` 로 미루면 옛 값으로 한 번 그려진 뒤 다시 그려져 깜빡인다.
 * 결과 뷰에서 검색창을 다시 편집하면 `viewQuery` 만 비워 자동완성으로 돌아가고 URL 은
 * 건드리지 않는다(타이핑마다 히스토리를 어지럽히지 않기 위함).
 */
export function SearchPageContent({ defaultContent, urlQuery }: SearchPageContentProps) {
  const router = useRouter();

  const [barValue, setBarValue] = useState(urlQuery);
  const [viewQuery, setViewQuery] = useState(urlQuery);
  const [syncedUrlQuery, setSyncedUrlQuery] = useState(urlQuery);

  if (syncedUrlQuery !== urlQuery) {
    setSyncedUrlQuery(urlQuery);
    setBarValue(urlQuery);
    setViewQuery(urlQuery);
  }

  const handleQueryChange = (value: string) => {
    setBarValue(value);
    setViewQuery('');
  };

  const handleSubmit = (value: string) => {
    setBarValue(value);
    setViewQuery(value);
    const href = `/search?q=${encodeURIComponent(value)}`;
    // 첫 검색만 push 한다. 결과 화면에서 다시 검색할 때도 push 하면 히스토리가
    // `/search → ?q=A → ?q=B` 로 쌓여, 뒤로가기가 검색 탭이 아니라 이전 결과(A)로
    // 간다 — 이 화면의 요구사항은 "결과에서 뒤로가기 = 검색 탭"이라 replace 로 덮는다.
    if (urlQuery.trim()) {
      router.replace(href, { scroll: false });
    } else {
      router.push(href, { scroll: false });
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <SearchPageHeader
        value={barValue}
        onQueryChange={handleQueryChange}
        onSubmit={handleSubmit}
      />
      {viewQuery.trim() ? (
        <SearchResultSection query={viewQuery} />
      ) : barValue.trim() ? (
        <SearchSuggestionsSection query={barValue} onSelectKeyword={setBarValue} />
      ) : (
        defaultContent
      )}
      <SearchPageBottomSpacer />
    </div>
  );
}
