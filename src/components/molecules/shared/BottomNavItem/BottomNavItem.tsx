import Link from 'next/link';

import { TabIcon, type TabName } from '@/components/atoms/TabIcon';

/**
 * 플로팅 하단 네비게이션 바(organisms/shared/BottomNav)의 탭 1개.
 * Figma "Tab_Button" (node 2192-759, Property 1=Default/Active) 1:1 매핑.
 * 탭 패널 전환이 아니라 페이지 이동이므로 TabBar/TabItem(role="tab")과 달리
 * `next/link` + `aria-current="page"` 를 쓴다 — WAI-ARIA 사이트 내비게이션 패턴.
 * 상호작용은 Link 가 처리하므로 이 컴포넌트엔 "use client" 가 필요 없다.
 *
 * Figma 는 2단 구조다 — 바깥 "_Tab Bar Button - iPhone - Text"(72~77px, 탭 영역/탭 target)
 * 안에 고정 56px 짜리 "Tab_Button"(아이콘+라벨+active 캡슐+배지)이 가운데 정렬로 들어있다.
 * 바깥을 BottomNav 가 flex-1 로 늘려도(탭 영역이 352px 를 꽉 채우도록), 캡슐·배지 같은
 * absolute 요소는 반드시 안쪽 고정 56px 블록 기준으로 위치잡아야 한다 — 늘어나는 바깥
 * Link 기준으로 두면 탭 영역이 넓어질수록 배지가 아이콘에서 멀어진다.
 */
export type BottomNavItemProps = {
  tab: TabName;
  label: string;
  href: string;
  active?: boolean;
  /** 알림 등 강조 표시가 있을 때만 true — 상시 노출 아님 (구현 예정: 알림 도메인 훅 연동) */
  badge?: boolean;
  className?: string;
};

export function BottomNavItem({
  tab,
  label,
  href,
  active = false,
  badge = false,
  className,
}: BottomNavItemProps) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`h-nav-item flex min-w-14 items-center justify-center ${className ?? ''}`.trim()}
    >
      <span className="relative flex w-14 flex-col items-center gap-0.5">
        {active && (
          <span
            aria-hidden="true"
            className="bg-overlay-blue h-nav-capsule w-nav-capsule absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          />
        )}
        {badge && (
          <span
            aria-hidden="true"
            className="bg-orange absolute top-0 right-2 size-1.5 rounded-full"
          />
        )}
        <TabIcon tab={tab} active={active} aria-hidden className="relative z-10" />
        <span
          className={`text-caption-s relative font-bold ${active ? 'text-primary' : 'text-fg'}`}
        >
          {label}
          {badge && <span className="sr-only"> (새 알림 있음)</span>}
        </span>
      </span>
    </Link>
  );
}
