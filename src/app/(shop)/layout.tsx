import type { ReactNode } from 'react';

import { BottomNav } from '@/components/organisms/shared/BottomNav';

/**
 * (shop) 셸: Header(+장바구니 아이콘) / BottomNav(홈·라운지·카테고리·검색·마이컬리).
 * 실제 Header 는 components/organisms/shared 에서 구현 예정.
 * <main> 의 pb-24 는 BottomNav 가 fixed 로 떠 있어 실제 문서 흐름을 차지하지 않는 만큼
 * 콘텐츠 하단이 가려지지 않도록 예약한 여백 — BottomNav 실측 높이(~98px)에 맞춘 근사치.
 */
export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-screen-sm flex-col">
      {/* TODO: <Header /> — components/organisms/shared */}
      <main className="flex-1 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
