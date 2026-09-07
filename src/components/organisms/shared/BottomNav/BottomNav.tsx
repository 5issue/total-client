'use client';

import { usePathname } from 'next/navigation';

import type { TabName } from '@/components/atoms/TabIcon';
import { BottomNavItem } from '@/components/molecules/shared/BottomNavItem';

/**
 * (shop) 셸 공통 플로팅 하단 네비게이션 바. Figma "State=Home/Rounge/Category/Search/Mypage"
 * (node 2368-429 외 4개) 1:1 매핑 — 5개 상태는 전부 usePathname() 기준 activeTab 만 다르다.
 * 순서는 Figma 그대로: 홈 - 라운지 - 카테고리 - 검색 - 마이컬리.
 */
type NavItem = {
  tab: TabName;
  label: string;
  href: string;
};

const NAV_ITEMS: NavItem[] = [
  { tab: 'home', label: '홈', href: '/' },
  { tab: 'lounge', label: '라운지', href: '/lounge' },
  { tab: 'category', label: '카테고리', href: '/category' },
  { tab: 'search', label: '검색', href: '/search' },
  { tab: 'my', label: '마이컬리', href: '/mypage' },
];

export type BottomNavProps = {
  /** 탭별 알림 배지. 알림 도메인 훅이 아직 없어 상위 컨테이너가 주입하는 형태로 시작
   *  (구현 예정 — hooks/notification 등). 기본은 전부 노출 안 함. */
  badges?: Partial<Record<TabName, boolean>>;
  className?: string;
};

export function BottomNav({ badges, className }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="주요 메뉴"
      className={`fixed inset-x-0 bottom-0 z-50 flex justify-center px-6 pt-4 pb-7 ${className ?? ''}`.trim()}
    >
      {/* 흰 pill(BG)은 콘텐츠 행(352px)보다 사방 4px 더 큰 inset(-4px) 레이어다(node 2368-429
          "BG") — 실제 pill 은 360×62. 콘텐츠 행을 정확히 352px(w-88)로 고정하고 p-1(4px)
          패딩으로 감싸 그 관계를 그대로 재현한다. */}
      <div className="bg-surface shadow-nav rounded-full p-1">
        <div className="flex w-88 items-start justify-center px-0.5">
          {NAV_ITEMS.map((item) => (
            <BottomNavItem
              key={item.tab}
              tab={item.tab}
              label={item.label}
              href={item.href}
              active={isActive(pathname, item.href)}
              badge={badges?.[item.tab]}
              className="flex-1"
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
