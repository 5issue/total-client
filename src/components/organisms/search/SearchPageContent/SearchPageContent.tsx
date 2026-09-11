'use client';

import { useState, type ReactNode } from 'react';

import { SearchPageBottomSpacer } from '@/components/organisms/search/SearchPageBottomSpacer';
import { SearchPageHeader } from '@/components/organisms/search/SearchPageHeader';
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
}

/**
 * `/search` 화면 본문 오케스트레이터 (organism).
 *
 * 검색어(`query`)를 여기서 소유한다 — 헤더의 검색창과, 본문이 "기본 콘텐츠 vs
 * 자동완성 드롭다운" 중 무엇을 보여줄지가 같은 값을 공유해야 하는데, 헤더/본문이
 * 형제 컴포넌트라 공통 부모가 상태를 들고 있어야 한다. 이 상태(query) 때문에 이
 * 컴포넌트 자체는 `'use client'` 가 불가피하지만, 그 경계를 실제로 상태를 쓰는
 * `SearchPageHeader`/`SearchSuggestionsSection` 으로만 좁혔다(`defaultContent` 설명 참고).
 */
export function SearchPageContent({ defaultContent }: SearchPageContentProps) {
  const [query, setQuery] = useState('');

  return (
    <div className="flex flex-1 flex-col">
      <SearchPageHeader value={query} onQueryChange={setQuery} />
      {query.trim() ? (
        <SearchSuggestionsSection query={query} onSelectKeyword={setQuery} />
      ) : (
        defaultContent
      )}
      <SearchPageBottomSpacer />
    </div>
  );
}
