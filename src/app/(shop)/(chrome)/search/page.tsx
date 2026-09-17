import { DietRecommendationBanner } from '@/components/organisms/search/DietRecommendationBanner';
import { RecentSearchesSection } from '@/components/organisms/search/RecentSearchesSection';
import { RecommendedKeywordsSection } from '@/components/organisms/search/RecommendedKeywordsSection';
import { SearchPageContent } from '@/components/organisms/search/SearchPageContent';
import { TrendingSearchesSection } from '@/components/organisms/search/TrendingSearchesSection';

/**
 * 검색 탭. 제출된 검색어는 `?q=` 로 URL 에 남는다 — 결과 화면에서 단말기/브라우저
 * 뒤로가기를 눌렀을 때 홈이 아니라 검색 탭 기본 화면으로 돌아오게 하려면 결과 뷰가
 * 히스토리 항목을 가져야 하기 때문(#90 QA, `SearchPageContent` 주석 참고).
 * `searchParams` 를 읽으므로 이 라우트는 동적 렌더링이다.
 */
export default async function SearchPage({ searchParams }: PageProps<'/search'>) {
  const { q } = await searchParams;

  return (
    <SearchPageContent
      urlQuery={typeof q === 'string' ? q : ''}
      defaultContent={
        <>
          <DietRecommendationBanner />
          <RecentSearchesSection />
          <RecommendedKeywordsSection />
          <TrendingSearchesSection />
        </>
      }
    />
  );
}
