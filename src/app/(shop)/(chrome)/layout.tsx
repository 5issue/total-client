import type { ReactNode } from 'react';

import { ShopShell } from '@/components/organisms/shared/ShopShell';

/**
 * BottomNav + 전역 스와이프 탭 + 하단 여백이 있는 화면.
 * 크롬 여부는 pathname 이 아니라 이 라우트 그룹이 결정한다 —
 * 레이아웃 Client Component 가 `usePathname()` 으로 트리를 바꾸면
 * 정적 프리렌더 HTML 과 클라 하이드레이션이 어긋난다.
 */
export default function ShopChromeLayout({ children }: { children: ReactNode }) {
  return <ShopShell>{children}</ShopShell>;
}
