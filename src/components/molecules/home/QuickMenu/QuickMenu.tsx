'use client';

import { Icon, type IconName } from '@/components/atoms/Icon/Icon';

/**
 * 홈 상단 유틸리티 퀵메뉴 아이템 (Figma "Quick_Menu", node 2428-1746).
 * 아이콘 + 라벨 + 선택적 숫자 카운트(예: "쿠폰 3"). 그래픽/New 배지가 있는
 * 프로모션형은 QuickMenuItem 을 쓴다.
 */
export type QuickMenuProps = {
  icon: IconName;
  label: string;
  count?: number;
  onClick?: () => void;
  className?: string;
};

export function QuickMenu({ icon, label, count, onClick, className }: QuickMenuProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={['flex w-[52px] flex-col items-center justify-center gap-1 py-1', className]
        .filter(Boolean)
        .join(' ')}
    >
      <Icon name={icon} size={28} aria-hidden />
      <span className="flex items-center gap-1 whitespace-nowrap">
        <span className="text-body-m text-fg">{label}</span>
        {count !== undefined && (
          <span className="text-numeric-l font-numeric text-primary">{count}</span>
        )}
      </span>
    </button>
  );
}
