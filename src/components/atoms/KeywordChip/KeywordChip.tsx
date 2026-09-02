'use client';

/**
 * 검색 추천/연관 키워드 칩 (Figma "Tab_Item2" > Keyword_Chip). TabItem 과 같은
 * "선택 가능한 목록" 패턴이지만 타이포·색 체계가 달라 별도 atom으로 분리했다 —
 * inactive: Label/XS Regular(14px) + Text/Secondary, active: Label/M Medium(500)
 * + Text/Primary(#222222, 브랜드색 아님). 목록 컨테이너(Scroll_Container, 가로 스크롤
 * + gap 10px)는 사용하는 쪽(organism)에서 flex + overflow-x-auto 로 조립한다.
 *
 * 높이는 Figma 스펙(36px)을 그대로 따른다 — code-style-convention §5 의 44px 터치
 * 타깃 권장값에는 못 미치지만(ServiceSwitch 와 동일한 트레이드오프), 너비는 짧은
 * 라벨에서도 최소 44px 을 보장한다(min-w-11).
 */
export type KeywordChipProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

export function KeywordChip({
  label,
  active = false,
  disabled = false,
  onClick,
  className,
}: KeywordChipProps) {
  const colorClassName = disabled
    ? 'text-fg-disabled text-label-xs'
    : active
      ? 'text-fg text-label-m'
      : 'text-fg-secondary text-label-xs';

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      disabled={disabled}
      onClick={onClick}
      className={`min-w-11 shrink-0 rounded-full px-2 py-2 whitespace-nowrap transition-colors motion-reduce:transition-none ${colorClassName} ${className ?? ''}`.trim()}
    >
      {label}
    </button>
  );
}
