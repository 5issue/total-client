import { CategoryTabs } from '@/components/organisms/home/CategoryTabs';
import { HeroBanner } from '@/components/organisms/home/HeroBanner';
import { HomeHeader } from '@/components/organisms/home/HomeHeader';
import { HomeProductSections } from '@/components/organisms/home/HomeProductSections';

/**
 * 홈 (`/`, SL-HOME 001~004, 006). Figma "HomeScreen" (node 577:20623).
 *
 * `#136`부터 퀵메뉴(`QuickMenuSection`)·진열 섹션(`HomeProductSections`)이
 * 실 API(`GET /api/v1/products/home-recommendations`, `useHomeRecommendations`)로
 * 연동됐다 — 내부에서 훅을 호출하는 클라이언트 organism이라 이 페이지는 서버
 * 컴포넌트로 남는다. `CategoryTabs`는 `GET /api/v1/products/categories`가 실제로는
 * 홈 탭 용도가 아닌 것으로 확인돼(이슈 #136 논의) 여전히 퍼블리싱 mock(15개
 * 하드코딩)이다. `HeroBanner`도 대응하는 백엔드 엔드포인트가 없어(#136 범위 밖)
 * 여전히 정적 mock 배너 1개로 렌더한다. `HomeHeader`의 `cartCount`도 cart 도메인
 * API가 없어 임시값(4)이다.
 *
 * 렌더링 전략: 구조 문서 기준 최종형은 "ISR 셸 + CSR 개인화 구획"인데, 배너/헤더/
 * 카테고리 탭은 여전히 정적이라 페이지 골격 자체는 정적(prerender)이고 퀵메뉴·진열
 * 섹션만 CSR 훅으로 개인화 구획을 이룬다.
 *
 * 진열 섹션 + "담기" 클릭 시 뜨는 장바구니 담기 바텀시트(node 838:65977)는
 * `HomeProductSections` 클라이언트 경계 하나로 묶었다(퀵메뉴 포함, #136) — 이 페이지는 서버로 남는다.
 */
export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HomeHeader cartCount={4} />
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
      <HomeProductSections />
    </div>
  );
}
