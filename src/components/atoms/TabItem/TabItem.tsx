'use client';

/**
 * 밑줄형 단일 탭. Figma "Tab_Bar" 컴포넌트셋의 Tab_Item / Tab_Item2 / Tab_Bar_Ver2
 * 아이템을 전부 이 atom 하나로 표현한다 — 시각 차이는 active 여부(볼드 + 밑줄)뿐이다.
 * 리스트 컨텍스트에서는 TabBar 가 role="tablist" 를 감싸고 이 컴포넌트에 role="tab" 을 준다.
 */
export type TabItemProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

export function TabItem({
  label,
  active = false,
  disabled = false,
  onClick,
  className,
}: TabItemProps) {
  const stateClassName = disabled
    ? 'border-transparent text-fg-disabled text-heading-3'
    : active
      ? 'border-brand-secondary text-brand-secondary text-heading-2'
      : 'border-transparent text-fg-tertiary text-heading-3';

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-11 shrink-0 items-center justify-center border-b-2 px-4 whitespace-nowrap transition-colors ${stateClassName} ${className ?? ''}`.trim()}
    >
      {label}
    </button>
  );
}
