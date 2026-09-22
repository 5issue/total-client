import { CategoryTabs } from '@/components/organisms/home/CategoryTabs';
import { MOCK_DISPLAY_SECTIONS } from '@/components/organisms/home/DisplaySectionList/mock';
import { HeroBanner } from '@/components/organisms/home/HeroBanner';
import { HomeHeaderContainer } from '@/components/organisms/home/HomeHeader';
import { HomeProductSections } from '@/components/organisms/home/HomeProductSections';
import { QuickMenuSection } from '@/components/organisms/home/QuickMenuSection';

/**
 * 홈 (`/`, SL-HOME 001~004, 006). Figma "HomeScreen" (node 577:20623).
 * 진열/배너 등은 아직 UI 퍼블리싱만 — API 미연동, 각 organism 내부 mock 데이터로 렌더한다
 * (structure-convention §6-2, 홈 구성 API 스펙 미확정). 헤더의 장바구니 배지만 예외 —
 * `HomeHeaderContainer` 가 실제 `useCart()` 로 채운다(2026-09-23).
 *
 * 렌더링 전략: 구조 문서 기준 최종형은 "ISR 셸 + CSR 개인화 구획" 이지만, 나머지 데이터가
 * 전부 정적 mock 이라 페이지 자체는 정적(prerender) 이다 — 장바구니 배지가 그 개인화
 * 구획의 첫 사례. 남은 부분(퀵메뉴 카운트, 진열 추천 등)도 API 연동 시 같은 패턴으로 CSR
 * 훅으로 전환한다.
 *
 * 진열 섹션 + "담기" 클릭 시 뜨는 장바구니 담기 바텀시트(node 838:65977)는
 * `HomeProductSections` 클라이언트 경계 하나로 묶었다 — 이 페이지는 서버로 남는다.
 */
export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HomeHeaderContainer />
      <CategoryTabs />
      <HeroBanner
        banners={[
          {
            imageSrc: '/banners/today-deal.webp',
            imageAlt: '오늘만이 가격, 지금 반값세일 중',
            eyebrow: '오늘만이 가격',
            title: '지금 반값세일 중',
            description: '오늘의 특가 보러 가기',
            href: '/products?section=today-deal',
          },
        ]}
      />
      <QuickMenuSection />
      <HomeProductSections sections={MOCK_DISPLAY_SECTIONS} />
    </div>
  );
}
