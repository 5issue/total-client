import type { ReactNode } from 'react';

import { Icon, type IconName } from '@/components/atoms/Icon/Icon';

/**
 * 상품 D-day/필터 태그 (Figma "Input Badge", node 2423-1003/1005(S), 2423-1006/2526-5665(M)).
 * S 는 아이콘 없이 텍스트만(필터/선택 칩), M 은 냉동/유통기한 임박 아이콘 + D-day 텍스트다.
 * Figma 컴포넌트 세트에 S+expire·M+selected 조합이 없어 — atoms/Badge 의 purple+large
 * 차단과 같은 방식으로 size 를 판별자로 둔 discriminated union 으로 타입에서부터 막는다.
 */
type SColor = 'light' | 'selected';
type MColor = 'light' | 'expire';

interface InputBadgeCommonProps {
  children: ReactNode;
  className?: string;
}

export type InputBadgeProps =
  | ({ size: 'S'; color?: SColor } & InputBadgeCommonProps)
  | ({ size?: 'M'; color?: MColor } & InputBadgeCommonProps);

const S_COLOR_CLASSNAME: Record<SColor, string> = {
  light: 'bg-surface-secondary text-fg-secondary',
  selected: 'bg-neutral-950 text-white',
};

/** S 는 Figma 상 Bold(700) — `text-caption-s`(기본 400) 뒤에 `font-bold` 를 붙여 맞춘다. */
const S_BASE_CLASSNAME =
  'inline-flex items-center justify-center gap-1 rounded-full px-2 py-1 text-caption-s font-bold whitespace-nowrap';

const M_COLOR_CLASSNAME: Record<MColor, string> = {
  light: 'bg-surface-secondary text-fg-secondary',
  expire: 'bg-error text-fg-danger',
};

/**
 * 아이콘도 색상별로 다른 asset이다 — 눈꽃 모양은 같지만 Figma에서 light 는 freeze(#69a3e1),
 * expire 는 Surface/Danger(#d24b3a)로 각각 고정색 export 돼 있어(themable 아님) 하나의
 * `frozen` 아이콘에 className 으로 색을 덧칠할 수 없다. coupon/coupon-cyan 과 같은 방식으로
 * `frozen-danger` 아이콘을 별도 등록해서 색상별로 다른 이름을 쓴다.
 */
const M_ICON_NAME: Record<MColor, IconName> = {
  light: 'frozen',
  expire: 'frozen-danger',
};

export function InputBadge(props: InputBadgeProps) {
  const { children, className } = props;

  if (props.size === 'S') {
    const color = props.color ?? 'light';

    return (
      <span
        className={[S_BASE_CLASSNAME, S_COLOR_CLASSNAME[color], className]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </span>
    );
  }

  const color = props.color ?? 'light';

  return (
    <span
      className={[
        'inline-flex h-6 items-center rounded-full py-0 pr-2 pl-1',
        M_COLOR_CLASSNAME[color],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Icon name={M_ICON_NAME[color]} size={20} aria-hidden />
      <span className="text-caption-m whitespace-nowrap">{children}</span>
    </span>
  );
}
