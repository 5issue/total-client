'use client';

import { usePathname } from 'next/navigation';

import type { TabName } from '@/components/atoms/TabIcon';
import { BottomNavItem } from '@/components/molecules/shared/BottomNavItem';

import { isNavItemActive, NAV_ITEMS } from './nav-items';

/**
 * (shop) 셸 공통 플로팅 하단 네비게이션 바. Figma "State=Home/Rounge/Category/Search/Mypage"
 * (node 2368-429 외 4개) 1:1 매핑 — 5개 상태는 전부 usePathname() 기준 activeTab 만 다르다.
 * 순서는 Figma 그대로: 홈 - 라운지 - 카테고리 - 검색 - 마이컬리(nav-items.ts 에서 관리).
 *
 * 스와이프로 탭 전환은 이 컴포넌트가 아니라 SwipeTabShell(organisms/shared/SwipeTabShell)
 * 이 (shop) 레이아웃 전체를 감싸 처리한다 — "바 위에서만"이 아니라 화면 어디서든 스와이프가
 * 되어야 한다는 요구(디자인팀, PR #58 리뷰)라 이 컴포넌트 범위를 벗어난다.
 */
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
              active={isNavItemActive(pathname, item.href)}
              badge={badges?.[item.tab]}
              className="flex-1"
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
