'use client';

import { useId } from 'react';

import { LOGOS, type LogoName } from './logos.generated';

export type { LogoName };

/**
 * 브랜드 워드마크/마크. Icon 과 달리 색이 배경에 맞춰 고정돼 있어 currentColor 로
 * 바꾸지 않는다(예: kurly-l/kurly 는 흰 잉크 — 어두운 배경용, kurly-xl 은 퍼플 잉크
 * — 밝은 배경용). 가로세로 비율도 로고마다 달라 `height` 기준으로 스케일하고
 * `width` 는 원본 비율로 자동 계산한다.
 *
 * `aria-label` 은 로고가 유일한 콘텐츠인 상호작용 요소(헤더 로고 링크 등)에 필수다.
 * 옆에 이미 텍스트가 있는 장식용 배치라면 `aria-hidden` 을 명시한다.
 * (code-style-convention §5)
 */
export type LogoProps = {
  name: LogoName;
  /** px 단위. width 는 원본 비율로 자동 계산됨. 기본 24 */
  height?: number;
  className?: string;
} & (
  { 'aria-label': string; 'aria-hidden'?: never } | { 'aria-label'?: never; 'aria-hidden'?: true }
);

export function Logo({ name, height = 24, className, ...aria }: LogoProps) {
  const uid = useId();
  const logo = LOGOS[name];
  const idFor = (raw: string) => `logo-${uid}-${raw}`;

  const hasLabel = 'aria-label' in aria && Boolean(aria['aria-label']);

  return (
    <svg
      width={height * logo.aspectRatio}
      height={height}
      viewBox={logo.viewBox}
      fill="none"
      className={className}
      aria-label={hasLabel ? aria['aria-label'] : undefined}
      aria-hidden={hasLabel ? undefined : (aria['aria-hidden'] ?? true)}
      role={hasLabel ? 'img' : undefined}
    >
      {logo.render(idFor)}
    </svg>
  );
}
