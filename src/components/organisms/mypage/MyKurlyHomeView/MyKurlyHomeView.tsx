'use client';

import { useState } from 'react';

import { KurlyHeader } from '@/components/organisms/shared/KurlyHeader';

import { BenefitPromoBottomSheet } from './BenefitPromoBottomSheet';
import { CuratorSection } from './CuratorSection';
import { PromoSummarySection } from './PromoSummarySection';
import { ShoppingLinksSection } from './ShoppingLinksSection';

/**
 * 마이컬리 홈 화면(`/mypage`) — Figma node 910-110880(기본) / 698-62968(혜택 알림
 * 바텀시트, 동일 화면 + 디밍 오버레이). issue #106.
 *
 * 하단 여백은 `(chrome)/layout.tsx` → `ShopShell` 이 `pb-bottom-nav-safe` 로 이미
 * 예약하므로 여기서 따로 두지 않는다.
 *
 * 바텀시트는 두 번째 Figma 프레임이 진입 즉시 떠 있는 상태로 그려져 있어 마운트 시
 * 자동으로 연다. 노출 조건(최초 방문 여부 등)과 "30일 동안 보지 않기"의 영속 저장은
 * 정책 미정이라 이번 범위에서는 클라 상태로 여닫기만 한다(issue #106 — API 연동 전이라
 * 새로고침하면 다시 뜬다).
 */
export function MyKurlyHomeView() {
  const [benefitSheetOpen, setBenefitSheetOpen] = useState(true);

  return (
    <div className="flex flex-1 flex-col">
      <KurlyHeader />
      <div className="flex flex-1 flex-col">
        <PromoSummarySection />
        <CuratorSection />
        <ShoppingLinksSection />
      </div>
      <BenefitPromoBottomSheet open={benefitSheetOpen} onClose={() => setBenefitSheetOpen(false)} />
    </div>
  );
}
