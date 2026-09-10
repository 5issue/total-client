import { DietRecommendationBanner } from '@/components/organisms/search/DietRecommendationBanner';
import { RecentSearchesSection } from '@/components/organisms/search/RecentSearchesSection';
import { RecommendedKeywordsSection } from '@/components/organisms/search/RecommendedKeywordsSection';
import { SearchPageHeader } from '@/components/organisms/search/SearchPageHeader';
import { TrendingSearchesSection } from '@/components/organisms/search/TrendingSearchesSection';

export default function SearchPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SearchPageHeader />
      <DietRecommendationBanner />
      <RecentSearchesSection />
      <RecommendedKeywordsSection />
      <TrendingSearchesSection />
    </div>
  );
}
