import { ThemeScope } from '@/components/molecules/shared/ThemeScope';
import { KurlyHeader } from '@/components/organisms/shared/KurlyHeader';

import { BenefitPromoBottomSheet } from './BenefitPromoBottomSheet';
import { CuratorSection } from './CuratorSection';
import { PromoSummarySection } from './PromoSummarySection';
import { ShoppingLinksSection } from './ShoppingLinksSection';

/**
 * 마이컬리 홈 화면(`/mypage`) — Figma node 910-110880(기본) / 698-62968(혜택 알림
 * 바텀시트, 동일 화면 + 디밍 오버레이). issue #106.
 *
 * 하단 여백은 `ShopShell`이 `pb-bottom-nav-safe`로 이미 예약해 여기선 안 둔다.
 * 바텀시트는 Figma 두 번째 프레임이 진입 즉시 떠 있는 상태라 마운트 시 자동으로 연다
 * (`BenefitPromoBottomSheet` 자체 state) — 이 화면은 그 자체로 상호작용 state 가 없어
 * RSC로 유지한다(코드래빗 리뷰, #111. 예전엔 그 state 를 여기서 들고 있어 트리 전체가
 * 클라이언트 경계였다). `ThemeScope`(다크모드 스코프, `'use client'` 자체 보유)는
 * children 을 받는 client 컴포넌트라 이 RSC 에서 그대로 감싸 써도 무방하다.
 *
 * `ThemeScope` 로 감싸 다크모드를 이 화면 서브트리로 제한한다(2026-09-18, "우선
 * 마이컬리만" 결정) — `ShopShell` 의 BottomNav 등 이 컴포넌트 밖의 공용 셸은 다크
 * 검증 전이라 범위 밖에 그대로 둔다.
 */
export function MyKurlyHomeView() {
  return (
    <ThemeScope className="flex flex-1 flex-col">
      <KurlyHeader showThemeToggle />
      <div className="flex flex-1 flex-col">
        <PromoSummarySection />
        <CuratorSection />
        <ShoppingLinksSection />
      </div>
      <BenefitPromoBottomSheet />
    </ThemeScope>
  );
}
