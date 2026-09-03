/**
 * 단계 진행 인디케이터 (atom).
 * Figma "5팀 디자인 시스템" — node 2448-1980 "Indigator".
 *
 * - 가로로 이어진 단계 목록. 각 단계는 점(dot) + 라벨, 사이는 연결선.
 * - `current` 인덱스의 단계만 활성(퍼플 점 + 퍼플 라벨)으로 표시한다.
 *   (Figma 에는 "완료된 단계" 스타일이 없다 — 활성/비활성 2상태뿐.)
 * - 표시 전용, 상호작용 없음(RSC 유지).
 */
export interface IndicatorProps {
  /** 단계 라벨 목록(디자인 기준 2~4개). */
  steps: string[];
  /** 활성 단계 인덱스(0-based). */
  current: number;
  /** 전체를 설명하는 접근성 라벨(예: "반품 진행 상태"). */
  'aria-label'?: string;
  className?: string;
}

const LABEL_BASE = 'w-full text-center';

export function Indicator({ steps, current, 'aria-label': ariaLabel, className }: IndicatorProps) {
  return (
    <ol
      aria-label={ariaLabel}
      className={['flex w-full items-start', className].filter(Boolean).join(' ')}
    >
      {steps.map((step, i) => {
        const active = i === current;
        return (
          <li
            key={`${i}-${step}`}
            aria-current={active ? 'step' : undefined}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <div className="flex w-full items-center gap-2" aria-hidden="true">
              <span className="bg-border h-px flex-1" />
              <span className="flex size-5 shrink-0 items-center justify-center">
                {active ? (
                  <span className="bg-brand-50 flex size-4 items-center justify-center rounded-full">
                    <span className="bg-primary size-2.5 rounded-full" />
                  </span>
                ) : (
                  <span className="size-2.5 rounded-full bg-neutral-400" />
                )}
              </span>
              <span className="bg-border h-px flex-1" />
            </div>
            <span
              className={
                active
                  ? `${LABEL_BASE} text-label-m text-primary`
                  : `${LABEL_BASE} text-label-xs text-fg`
              }
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
