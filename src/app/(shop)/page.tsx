import { CategoryTabs } from '@/components/organisms/home/CategoryTabs';
import { DisplaySectionList } from '@/components/organisms/home/DisplaySectionList';
import { MOCK_DISPLAY_SECTIONS } from '@/components/organisms/home/DisplaySectionList/mock';
import { HeroBanner } from '@/components/organisms/home/HeroBanner';
import { HomeHeader } from '@/components/organisms/home/HomeHeader';
import { QuickMenuSection } from '@/components/organisms/home/QuickMenuSection';

/**
 * 홈 (`/`, SL-HOME 001~004, 006). Figma "HomeScreen" (node 577:20623).
 * 이번 단계는 UI 퍼블리싱만 — API 미연동, 각 organism 내부 mock 데이터로 렌더한다
 * (structure-convention §6-2, 홈 구성 API 스펙 미확정).
 *
 * 렌더링 전략: 구조 문서 기준 최종형은 "ISR 셸 + CSR 개인화 구획" 이지만, 현재는
 * 데이터가 전부 정적 mock 이라 페이지 전체가 정적(prerender) 이다 — API 연동 시
 * 개인화 구획(퀵메뉴 카운트, 진열 추천 등)만 CSR 훅으로 전환한다.
 */
export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HomeHeader cartCount={4} />
      <CategoryTabs />
      <HeroBanner
        imageSrc="/banners/today-deal.webp"
        imageAlt="오늘만이 가격, 지금 반값세일 중"
        eyebrow="오늘만이 가격"
        title="지금 반값세일 중"
        description="오늘의 특가 보러 가기"
        href="/products?section=today-deal"
        current={4}
        total={30}
      />
      <QuickMenuSection />
      {MOCK_DISPLAY_SECTIONS.map((section) => (
        <DisplaySectionList
          key={section.id}
          title={section.title}
          subtitle={section.subtitle}
          href={section.href}
          products={section.products}
        />
      ))}
    </div>
  );
}
