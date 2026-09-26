'use client';

import { useId } from 'react';

import { TAB_ICONS, type TabName } from './tab-icons.generated';

export type { TabName };

/**
 * 하단 탭바 전용 아이콘. default/active 상태별로 색이 정해져 있어(Icon 의 단일
 * `currentColor` 모델과 다름) `currentColor` 로 바꾸지 않는다 — 대신 각 상태를
 * 시맨틱 프리미티브에 직접 바인딩한다(`scripts/icons/build-tabicon.mjs` 가 빌드 시 치환):
 * default → `Text/Primary`(`--fg`), active → `Brand/Primary`(`--primary`). 다크모드
 * 값은 `BottomNav`의 `[data-theme='dark']` 스코프에서 자동으로 갈린다(node 1941-89037
 * 실측, 2026-09-22) — `--color-fg`/`--color-primary`(별칭) 가 아니라 프리미티브를 직접
 * 쓰는 게 중요하다: 별칭은 Tailwind 클래스로 쓸 때만 로컬 테마로 inline 되고, `fill="var(--color-fg)"`
 * 처럼 raw CSS var 로 직접 참조하면 그 최적화를 안 타 루트(라이트) 값에 고정돼 버린다
 * (다크모드에서 탭 아이콘이 계속 검게 보이던 버그, 컬리키친 다크 QA).
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
