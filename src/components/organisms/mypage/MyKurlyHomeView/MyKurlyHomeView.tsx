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
 * (`BenefitPromoBottomSheet` 자체 state) — 이 화면은 상호작용 state 가 없어 RSC로
 * 유지한다(코드래빗 리뷰, #111. 예전엔 그 state 를 여기서 들고 있어 트리 전체가
 * 클라이언트 경계였다).
 */
export function MyKurlyHomeView() {
  return (
    <div className="flex flex-1 flex-col">
      <KurlyHeader />
      <div className="flex flex-1 flex-col">
        <PromoSummarySection />
        <CuratorSection />
        <ShoppingLinksSection />
      </div>
      <BenefitPromoBottomSheet />
    </div>
  );
}
