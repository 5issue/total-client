'use client';

import { useId } from 'react';

import { TAB_ICONS, type TabName } from './tab-icons.generated';

export type { TabName };

/**
 * 하단 탭바 전용 아이콘. 색이 고정(default #222222 / active #690085)이라
 * Icon 과 달리 currentColor 로 바꾸지 않는다.
 * `aria-label` 은 아이콘이 유일한 콘텐츠인 상호작용 요소에 필수, 옆에 라벨 텍스트가
 * 있으면 `aria-hidden` 을 명시한다. (code-style-convention §5)
 */
export type TabIconProps = {
  tab: TabName;
  active?: boolean;
  /** px 단위. 기본 28 */
  size?: number;
  className?: string;
} & (
  { 'aria-label': string; 'aria-hidden'?: never } | { 'aria-label'?: never; 'aria-hidden'?: true }
);

export function TabIcon({ tab, active = false, size = 28, className, ...aria }: TabIconProps) {
  const uid = useId();
  const variant = active ? TAB_ICONS[tab].active : TAB_ICONS[tab].default;
  const idFor = (raw: string) => `tab-icon-${uid}-${raw}`;

  const hasLabel = 'aria-label' in aria && Boolean(aria['aria-label']);

  return (
    <svg
      width={size}
      height={size}
      viewBox={variant.viewBox}
      fill="none"
      className={className}
      aria-label={hasLabel ? aria['aria-label'] : undefined}
      aria-hidden={hasLabel ? undefined : (aria['aria-hidden'] ?? true)}
      role={hasLabel ? 'img' : undefined}
    >
      {variant.render(idFor)}
    </svg>
  );
}
