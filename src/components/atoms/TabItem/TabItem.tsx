'use client';

/**
 * 밑줄형 단일 탭. Figma "Tab_Bar" 컴포넌트셋의 Tab_Item 을 표현한다 — 시각 차이는
 * active 여부(색 + 밑줄)뿐, 폰트 굵기는 active/inactive 동일(디자인 인스펙터 확인).
 * 리스트 컨텍스트에서는 TabBar 가 role="tablist" 를 감싸고 이 컴포넌트에 role="tab" 을 준다.
 *
 * 그룹마다 active 색이 다르다(상품설명=Brand-Secondary, 카테고리=Static-Black,
 * 추천=Brand-Primary) — `tone` 으로 선택. 추천 탭은 폰트 스케일도 다르다
 * (Label/M 14px SemiBold vs 나머지 Heading/M 18px Medium) — `size` 로 선택.
 */
export type TabItemTone = 'brand-secondary' | 'brand-primary' | 'black';
export type TabItemSize = 'sm' | 'lg';

const TONE_CLASSNAME: Record<TabItemTone, string> = {
  'brand-secondary': 'border-brand-secondary text-brand-secondary',
  'brand-primary': 'border-primary text-primary',
  black: 'border-fg text-fg',
};

const SIZE_CLASSNAME: Record<TabItemSize, string> = {
  sm: 'text-label-l',
  lg: 'text-heading-2',
};

export type TabItemProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  /** active 상태 색. 기본 brand-secondary(#50006B, 상품설명 등 콘텐츠 탭) */
  tone?: TabItemTone;
  /** 기본 lg(Heading/M 18px). 추천 키워드 탭처럼 작은 맥락은 sm(Label/M 14px) */
  size?: TabItemSize;
  onClick?: () => void;
  className?: string;
};

export function TabItem({
  label,
  active = false,
  disabled = false,
  tone = 'brand-secondary',
  size = 'lg',
  onClick,
  className,
}: TabItemProps) {
  const colorClassName = disabled
    ? 'border-transparent text-fg-disabled'
    : active
      ? TONE_CLASSNAME[tone]
      : 'border-transparent text-fg-secondary';

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-11 shrink-0 items-center justify-center border-b-2 px-1 whitespace-nowrap transition-colors ${colorClassName} ${SIZE_CLASSNAME[size]} ${className ?? ''}`.trim()}
    >
      {label}
    </button>
  );
}
