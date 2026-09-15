import type { ReactNode } from 'react';

/**
 * (shop) 셸: 모바일 폭 프레임만. Header 는 components/organisms/shared 에서 구현 예정.
 *
 * BottomNav·전역 스와이프 탭·하단 여백은 경로마다 다르다. 클라 `usePathname()` 분기는
 * 정적 프리렌더와 하이드레이션이 어긋나므로, 하위 라우트 그룹이 레이아웃으로 고정한다.
 * - `(chrome)`: ShopShell (BottomNav + SwipeTabShell)
 * - `(chromeless)`: `<main>` 만 (`/cart`, `/checkout/**`, `/mypage/addresses`)
 */
export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-screen-sm flex-col">
      {/* TODO: <Header /> — components/organisms/shared */}
      {children}
    </div>
  );
}
