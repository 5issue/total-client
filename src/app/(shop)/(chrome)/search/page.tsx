import { DietRecommendationBanner } from '@/components/organisms/search/DietRecommendationBanner';
import { RecentSearchesSection } from '@/components/organisms/search/RecentSearchesSection';
import { RecommendedKeywordsSection } from '@/components/organisms/search/RecommendedKeywordsSection';
import { SearchPageContent } from '@/components/organisms/search/SearchPageContent';
import { TrendingSearchesSection } from '@/components/organisms/search/TrendingSearchesSection';

export default function SearchPage() {
  return (
    <SearchPageContent
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
