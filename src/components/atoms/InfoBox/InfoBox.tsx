import type { ReactNode } from 'react';

/**
 * 안내/공지 박스 (atom).
 * Figma "5팀 디자인 시스템" — node 2418-6426 "Info Box".
 *
 * Figma 는 `round`(12/8) · `color`(Bright/Dark) · `stroke` · `Body` 4개 prop 의
 * 조합 중 8가지를 정의한다. 그 8가지는 실제로 "레이아웃 4형태 × 톤 2" 이므로
 * 여기서는 `variant`(형태) + `tone`(톤) 으로 정리했다.
 *
 * - `notice`  : 제목 + 여러 줄 안내(가장 큰 박스, radius 16).
 * - `callout` : 아이콘 + 제목 + 본문(radius 8).
 * - `inline`  : 아이콘 + 한 줄(radius 8).
 * - `bar`     : 테두리 + 가운데 정렬 한 줄, 아이콘 없음(radius 8).
 *
 * 아이콘은 컴포넌트가 그리지 않고 `icon` 슬롯으로 받는다(20×20 권장, Icon atom 도입 후 교체).
 * 표시 전용, 상호작용 없음(RSC 유지).
 */
export type InfoBoxVariant = 'notice' | 'callout' | 'inline' | 'bar';
export type InfoBoxTone = 'bright' | 'dark';

export interface InfoBoxProps {
  variant?: InfoBoxVariant;
  tone?: InfoBoxTone;
  /** `notice`·`callout` 의 제목. */
  title?: string;
  /** `callout`·`inline` 좌측 아이콘 슬롯. */
  icon?: ReactNode;
  /** 본문. `notice` 는 여러 개의 `<p>` 를 넘기면 줄 간격이 적용된다. */
  children: ReactNode;
  className?: string;
}

const TONE: Record<InfoBoxTone, string> = {
  bright: 'bg-info',
  dark: 'bg-info-dark',
};

const CONTAINER: Record<InfoBoxVariant, string> = {
  notice: 'flex flex-col gap-2 rounded-xl px-4 pt-4 pb-5',
  callout: 'flex flex-col gap-2 rounded-m p-3',
  inline: 'flex items-start gap-1 rounded-m p-3',
  bar: 'flex items-center justify-center rounded-m border border-border px-4 py-2',
};

export function InfoBox({
  variant = 'notice',
  tone = 'bright',
  title,
  icon,
  children,
  className,
}: InfoBoxProps) {
  const box = [CONTAINER[variant], TONE[tone], className].filter(Boolean).join(' ');

  if (variant === 'notice') {
    return (
      <div className={box}>
        {title ? <p className="text-heading-4 text-fg-secondary">{title}</p> : null}
        <div className="text-label-m text-fg-tertiary flex flex-col gap-1">{children}</div>
      </div>
    );
  }

  if (variant === 'callout') {
    return (
      <div className={box}>
        <div className="flex items-start gap-1">
          {icon ? (
            <span className="flex size-5 shrink-0 items-center justify-center">{icon}</span>
          ) : null}
          {title ? <p className="text-body-m text-fg-secondary flex-1">{title}</p> : null}
        </div>
        <div className="text-label-xs text-fg-tertiary">{children}</div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={box}>
        {icon ? (
          <span className="flex size-5 shrink-0 items-center justify-center">{icon}</span>
        ) : null}
        <div className="text-body-m text-fg-secondary flex-1">{children}</div>
      </div>
    );
  }

  return (
    <div className={box}>
      <div className="text-label-l text-fg-quaternary text-center">{children}</div>
    </div>
  );
}
