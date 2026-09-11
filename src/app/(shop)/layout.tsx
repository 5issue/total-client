import type { ReactNode } from 'react';

import { ShopShell } from '@/components/organisms/shared/ShopShell';

/**
 * (shop) 셸: Header(+장바구니 아이콘) / BottomNav(홈·라운지·카테고리·검색·마이컬리).
 * 실제 Header 는 components/organisms/shared 에서 구현 예정.
 *
 * BottomNav·전역 스와이프 탭·하단 여백은 경로마다 달라(장바구니처럼 자체 CTA 를 가진
 * 전체화면 뷰는 크롬을 끈다) usePathname 이 필요한 <ShopShell> 클라 경계가 담당한다 —
 * 이 layout 은 서버로 남고 children(page) 도 서버에서 그대로 렌더된다.
 * <ShopShell> 이 <main> 도 렌더하므로 여기서는 모바일 프레임만 감싼다.
 */
export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-screen-sm flex-col">
      {/* TODO: <Header /> — components/organisms/shared */}
      <ShopShell>{children}</ShopShell>
    </div>
  );
}
