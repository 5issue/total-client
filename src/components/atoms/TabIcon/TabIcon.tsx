'use client';

import { useId } from 'react';

import { TAB_ICONS, type TabName } from './tab-icons.generated';

export type { TabName };

/**
 * 하단 탭바 전용 아이콘. default/active 상태별로 색이 정해져 있어(Icon 의 단일
 * `currentColor` 모델과 다름) `currentColor` 로 바꾸지 않는다 — 대신 각 상태를
 * 시맨틱 토큰에 직접 바인딩한다(`scripts/icons/build-tabicon.mjs` 가 빌드 시 치환):
 * default → `Text/Primary`(`--color-fg`), active → `Brand/Primary`(`--color-primary`).
 * 둘 다 다크모드 값이 있어(`BottomNav` 마이컬리 다크 스코프, 2026-09-18) 테마에 따라
 * 자동으로 바뀐다 — Figma 에 BottomNav 다크 스펙은 없어 화면 나머지와 같은 토큰을
 * 재사용한 값이다(디자인 확인 전).
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
