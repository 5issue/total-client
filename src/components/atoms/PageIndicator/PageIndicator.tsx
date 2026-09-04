/**
 * 캐러셀/배너용 점(dot) 페이지 인디케이터 (atom). Figma "5팀 디자인 시스템" —
 * node 2428-1875 "Page control" 중 dot 스타일 프레임(2428:1857 black / 2428:1858 purple).
 *
 * 체크아웃 진행 단계를 보여주는 기존 `Indicator` atom(점+라벨, node 2448-1980)과
 * 이름이 헷갈릴 수 있는데 용도가 다르다 — 이쪽은 라벨 없이 순수 위치 표시용.
 *
 * Figma 실측: 비활성 점 = 검정 30% 불투명도, 활성 점만 톤 색(black/purple) 100%.
 * black은 점 8px·간격 8px, purple은 점 6px·간격 6px 로 크기 자체가 다르다
 * (`TONE_DOT_CLASSNAME`/`TONE_GAP_CLASSNAME`). `count`/`activeIndex` 는 호출부가
 * 정하는 값이라 강제하지 않지만, Figma에 정의된 purple 예시는 항상 점 2개뿐이었다.
 * 표시 전용, 상호작용 없음(RSC 유지).
 */
export type PageIndicatorTone = 'black' | 'purple';

export interface PageIndicatorProps {
  /** 전체 페이지 수. */
  count: number;
  /** 현재 활성 페이지 인덱스(0-based). */
  activeIndex: number;
  tone?: PageIndicatorTone;
  /** 전체를 설명하는 접근성 라벨(예: "배너 3개 중 1번째"). */
  'aria-label'?: string;
  className?: string;
}

const ACTIVE_CLASSNAME: Record<PageIndicatorTone, string> = {
  black: 'bg-fg',
  purple: 'bg-brand-300',
};

const TONE_DOT_CLASSNAME: Record<PageIndicatorTone, string> = {
  black: 'size-2',
  purple: 'size-1.5',
};

const TONE_GAP_CLASSNAME: Record<PageIndicatorTone, string> = {
  black: 'gap-2',
  purple: 'gap-1.5',
};

export function PageIndicator({
  count,
  activeIndex,
  tone = 'black',
  'aria-label': ariaLabel,
  className,
}: PageIndicatorProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={['inline-flex items-center', TONE_GAP_CLASSNAME[tone], className]
        .filter(Boolean)
        .join(' ')}
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={[
            'rounded-full',
            TONE_DOT_CLASSNAME[tone],
            i === activeIndex ? ACTIVE_CLASSNAME[tone] : 'bg-fg/30',
          ].join(' ')}
        />
      ))}
    </div>
  );
}
