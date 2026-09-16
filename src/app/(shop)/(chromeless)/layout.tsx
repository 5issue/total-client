import type { ReactNode } from 'react';

/**
 * 자체 하단 CTA 를 가진 전체화면 뷰 — BottomNav/스와이프 탭/하단 여백을 두지 않는다.
 * (`/cart`, `/checkout/**`, `/mypage/addresses`, `/mypage/orders`, `/products/[productId]`
 * — 상품 상세는 자체 하단 CTA(AddToCartActions)를 가져 크롬리스다, 이슈 #101)
 */
export default function ShopChromelessLayout({ children }: { children: ReactNode }) {
  return <main className="flex flex-1 flex-col">{children}</main>;
}
