/**
 * 가로 스크롤 위치를 보여주는 막대형 인디케이터 (atom). Figma "5팀 디자인 시스템" —
 * node 2428-1875 "Page control" 중 "Indicator/Scroll_Bar"(Step=Left/Center/Right).
 *
 * Figma에 3단계(Left/Center/Right)만 정의돼 있어 연속값(progress: 0~1)이 아니라
 * 3단계 고정 `position` 으로 구현한다 — 트랙(48px) 안에서 세그먼트(16px) 위치만
 * 셋 중 하나로 이동. 표시 전용, 상호작용 없음(RSC 유지).
 */
export type ScrollIndicatorPosition = 'left' | 'center' | 'right';

export interface ScrollIndicatorProps {
  position: ScrollIndicatorPosition;
  /** 전체를 설명하는 접근성 라벨(예: "카테고리 탭 가로 스크롤 위치"). */
  'aria-label'?: string;
  className?: string;
}

const POSITION_CLASSNAME: Record<ScrollIndicatorPosition, string> = {
  left: 'left-0',
  center: 'left-4',
  right: 'left-8',
};

export function ScrollIndicator({
  position,
  'aria-label': ariaLabel,
  className,
}: ScrollIndicatorProps) {
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={['relative h-1 w-12 rounded-full bg-neutral-600/40', className]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        className={`bg-fg absolute top-0 h-1 w-4 rounded-full transition-[left] motion-reduce:transition-none ${POSITION_CLASSNAME[position]}`}
      />
    </div>
  );
}
