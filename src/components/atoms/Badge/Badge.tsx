import type { ReactNode } from 'react';

export type BadgeColor = 'purple' | 'cyan';
export type BadgeSize = 'small' | 'medium' | 'large';

export interface BadgeProps {
  color?: BadgeColor;
  size?: BadgeSize;
  className?: string;
  /** 순수 정보 표시용이라 항상 필수 — Chip/Button과 달리 상호작용이 없다. */
  children: ReactNode;
}

/**
 * cyan 은 Figma 세 사이즈 전부 동일 hex(#00c0da = --color-cyan)라 그대로 매핑했다.
 * purple 은 Small(#d8a5e9 = brand-200)과 Medium(#c16edd = brand-300)이 서로 다른 톤이었다 —
 * Large 예시가 없어 어느 쪽이 기준인지 불확실. 더 채도가 높은 brand-300 을 기본으로 쓰고,
 * Small 에서의 옅은 톤은 디자이너 확인 후 반영한다.
 */
const COLOR_CLASSNAME: Record<BadgeColor, string> = {
  purple: 'bg-brand-300 text-fg-inverse',
  cyan: 'bg-cyan text-fg-inverse',
};

/**
 * Figma 실측은 Small/Medium 모두 Bold(700)인데, 10px·12px Bold 전용 타이포 토큰이 없어
 * 가장 가까운 caption 토큰(둘 다 weight 400)으로 우선 맞췄다 — 타이포 토큰 보강 필요.
 * Large(text-label-xl, 14/20/700)는 Figma 값과 정확히 일치한다.
 */
const SIZE_CLASSNAME: Record<BadgeSize, string> = {
  small: 'px-2 py-1 text-caption-s',
  medium: 'p-1 text-caption-m',
  large: 'p-2 text-label-xl',
};

export function Badge({ color = 'cyan', size = 'small', className, children }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center justify-center rounded-s whitespace-nowrap',
        COLOR_CLASSNAME[color],
        SIZE_CLASSNAME[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
