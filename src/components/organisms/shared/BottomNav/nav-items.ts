import type { TabName } from '@/components/atoms/TabIcon';

/**
 * BottomNav 탭 목록(Figma 순서: 홈-라운지-카테고리-검색-마이컬리) — BottomNav(렌더)와
 * SwipeTabShell(전역 스와이프 전환)이 같은 순서/라우트를 공유해야 해서 분리했다.
 */
export type NavItem = {
  tab: TabName;
  label: string;
  href: string;
};

export const NAV_ITEMS: NavItem[] = [
  { tab: 'home', label: '홈', href: '/' },
  { tab: 'lounge', label: '라운지', href: '/lounge' },
  { tab: 'category', label: '카테고리', href: '/category' },
  { tab: 'search', label: '검색', href: '/search' },
  { tab: 'my', label: '마이컬리', href: '/mypage' },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
