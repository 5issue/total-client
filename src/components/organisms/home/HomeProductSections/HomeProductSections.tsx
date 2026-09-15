'use client';

import { useState } from 'react';

import { DisplaySectionList } from '@/components/organisms/home/DisplaySectionList';
import type { MockDisplaySection } from '@/components/organisms/home/DisplaySectionList/mock';
import { ProductOptionSheet } from '@/components/organisms/product/ProductOptionSheet';

/**
 * 홈 진열 섹션 전체 + 장바구니 담기 바텀시트를 함께 소유하는 클라이언트 경계.
 * `(shop)/page.tsx` 는 서버 컴포넌트로 남기고, 시트 열림 상태(`useState`)가 필요한
 * 이 부분만 분리했다(RSC 우선 원칙, `ShopShell`/`SwipeTabShell` 과 같은 패턴).
 *
 * 모든 섹션이 같은 시트 인스턴스 하나를 공유한다 — 어느 카드의 "담기"를 눌러도
 * `ProductOptionSheet` 하나가 열린다(node 838:65977 확인, 상품마다 다른 시트가
 * 아니라 화면에 시트 오버레이가 하나 뜨는 구조).
 */
export type HomeProductSectionsProps = {
  sections: MockDisplaySection[];
};

export function HomeProductSections({ sections }: HomeProductSectionsProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      {sections.map((section) => (
        <DisplaySectionList
          key={section.id}
          title={section.title}
          subtitle={section.subtitle}
          href={section.href}
          products={section.products}
          onAddToCart={() => setSheetOpen(true)}
        />
      ))}
      <ProductOptionSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
