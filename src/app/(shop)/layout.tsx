import type { ReactNode } from 'react';

import { BottomNav } from '@/components/organisms/shared/BottomNav';
import { SwipeTabShell } from '@/components/organisms/shared/SwipeTabShell';

/**
 * (shop) 셸: Header(+장바구니 아이콘) / BottomNav(홈·라운지·카테고리·검색·마이컬리).
 * 실제 Header 는 components/organisms/shared 에서 구현 예정.
 * <main> 의 pb-24 는 BottomNav 가 fixed 로 떠 있어 실제 문서 흐름을 차지하지 않는 만큼
 * 콘텐츠 하단이 가려지지 않도록 예약한 여백 — BottomNav 실측 높이(~98px)에 맞춘 근사치.
 * SwipeTabShell 은 <main> 안쪽 콘텐츠만 감싼다 — BottomNav 는 탭(클릭)으로만 전환하면
 * 되고, 바 위에서까지 스와이프가 겹치지 않도록 일부러 바깥에 둔다.
 * <main> 을 flex 컨테이너로 만들고 SwipeTabShell 에 flex-1 을 줘서 실제 뷰포트 높이를
 * 채운다 — percentage-height(min-h-full)는 스텁 페이지처럼 콘텐츠가 짧을 때 부모 체인이
 * "definite height" 로 안정적으로 잡히지 않아 빈 공간이 스와이프 감지 영역 밖으로 빠졌다.
 */
export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-screen-sm flex-col">
      {/* TODO: <Header /> — components/organisms/shared */}
      <main className="flex flex-1 flex-col pb-24">
        <SwipeTabShell className="flex-1">{children}</SwipeTabShell>
      </main>
      <BottomNav />
    </div>
  );
}
