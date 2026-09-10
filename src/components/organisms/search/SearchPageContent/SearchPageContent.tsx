'use client';

import { useState } from 'react';

import { DietRecommendationBanner } from '@/components/organisms/search/DietRecommendationBanner';
import { RecentSearchesSection } from '@/components/organisms/search/RecentSearchesSection';
import { RecommendedKeywordsSection } from '@/components/organisms/search/RecommendedKeywordsSection';
import { SearchPageBottomSpacer } from '@/components/organisms/search/SearchPageBottomSpacer';
import { SearchPageHeader } from '@/components/organisms/search/SearchPageHeader';
import { SearchSuggestionsSection } from '@/components/organisms/search/SearchSuggestionsSection';
import { TrendingSearchesSection } from '@/components/organisms/search/TrendingSearchesSection';

/**
 * `/search` 화면 본문 오케스트레이터 (organism).
 *
 * 검색어(`query`)를 여기서 소유한다 — 헤더의 검색창과, 본문이 "기본 콘텐츠
 * (최근 검색어 등) vs 자동완성 드롭다운" 중 무엇을 보여줄지가 같은 값을 공유해야
 * 하는데, 헤더/본문이 형제 컴포넌트라 공통 부모가 상태를 들고 있어야 한다.
 * `page.tsx` 자체를 클라이언트 컴포넌트로 만들지 않으려고(code-style §1, use client
 * 는 트리 상단이 아니라 잎에) 이 오케스트레이터를 하나 더 끼워 넣었다.
 *
 * 자동완성 드롭다운(#69 — Figma node 577-13164 외)은 입력값이 비어있지 않을 때만
 * 기본 콘텐츠 대신 렌더한다.
 */
export function SearchPageContent() {
  const [query, setQuery] = useState('');

  return (
    <div className="flex flex-1 flex-col">
      <SearchPageHeader value={query} onQueryChange={setQuery} />
      {query.trim() ? (
        <SearchSuggestionsSection query={query} onSelectKeyword={setQuery} />
      ) : (
        <>
          <DietRecommendationBanner />
          <RecentSearchesSection />
          <RecommendedKeywordsSection />
          <TrendingSearchesSection />
        </>
      )}
      <SearchPageBottomSpacer />
    </div>
  );
}
