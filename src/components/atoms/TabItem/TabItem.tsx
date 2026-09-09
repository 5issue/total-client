'use client';

import { forwardRef, type KeyboardEventHandler } from 'react';

/**
 * 밑줄형 단일 탭. Figma "Tab_Bar" 컴포넌트셋의 Tab_Item 을 표현한다 — 시각 차이는
 * active 여부(색 + 밑줄)뿐, 폰트 굵기는 active/inactive 동일(디자인 인스펙터 확인).
 * 리스트 컨텍스트에서는 TabBar 가 role="tablist" 를 감싸고, roving tabIndex/방향키
 * 이동을 관리하며 이 컴포넌트에 role="tab" 을 준다.
 *
 * 그룹마다 active 색이 다르다(상품설명=Brand-Secondary, 카테고리=Static-Black,
 * 추천=Brand-Primary) — `tone` 으로 선택. 추천 탭은 폰트 스케일도 다르다
 * (Label/M 14px SemiBold vs 나머지 Heading/M 18px Medium) — `size` 로 선택.
 *
 * lg 탭은 Figma 실측(node 2429-1850, dev-mode 간격 측정) 기준 슬롯이 최소 96px
 * (`min-width`, 넘치는 라벨은 폰트 축소 없이 자연스럽게 더 넓어짐)이다. Gap/XS(8px)는
 * 프레임 사이 간격이 아니라 프레임↔텍스트 내부 패딩(`px-2`) — TabBar 는 아이템끼리
 * gap 없이 바로 붙인다.
 *
 * `variant="filled"`(issue #67, Figma node 2923-2605~2733 "Tab_item" 카운트뱃지
 * 추가분)는 완전히 다른 박스 모델이다 — 밑줄 대신 하단 2px 바, 인라인 행이 아니라
 * `flex-col` 고정 높이(48px) + 배지 카운트. 별도 atom 으로 쪼개는 대신 같은
 * "Tab_Item" 개념의 variant 로 묶었다(Figma 쪽도 한 컴포넌트셋). pressed 배경
 * (`Default_Pressed`/`Active_Pressed` = `Default`/`Active` 의 `:active` 상태)은
 * 별도 prop 없이 `active:` 유사클래스로 처리 — 컨트롤드 상태를 만들 이유가 없다.
 */
export type TabItemTone = 'brand-secondary' | 'brand-primary' | 'black';
export type TabItemSize = 'sm' | 'lg';
export type TabItemVariant = 'underline' | 'filled';

const TONE_CLASSNAME: Record<TabItemTone, string> = {
  'brand-secondary': 'border-brand-secondary text-brand-secondary',
  'brand-primary': 'border-primary text-primary',
  black: 'border-fg text-fg',
};

const SIZE_CLASSNAME: Record<TabItemSize, string> = {
  sm: 'text-label-l',
  lg: 'min-w-24 text-heading-2',
};

export type TabItemProps = {
  label: string;
  active?: boolean;
  /** 기본 underline(밑줄형, 기존 Tab_Bar). filled 는 카운트 배지가 붙는 채움형(카테고리 필터 등) */
  variant?: TabItemVariant;
  /** filled 전용. 라벨 옆에 표시할 개수 — underline 에서는 무시된다 */
  count?: number;
  /** active 상태 색. 기본 brand-secondary(#50006B, 상품설명 등 콘텐츠 탭). filled 는 항상 흑백(fg)이라 무시 */
  tone?: TabItemTone;
  /** 기본 lg(Heading/M 18px, 최소폭 96px). 추천 키워드 탭처럼 작은 맥락은 sm(Label/M 14px) */
  size?: TabItemSize;
  /** roving tabIndex — TabBar 가 관리(활성 탭만 0, 나머지 -1). 단독 사용 시 기본 포커스 가능(0) */
  tabIndex?: number;
  onClick?: () => void;
  onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
  className?: string;
};

export const TabItem = forwardRef<HTMLButtonElement, TabItemProps>(function TabItem(
  {
    label,
    active = false,
    variant = 'underline',
    count,
    tone = 'brand-secondary',
    size = 'lg',
    tabIndex = 0,
    onClick,
    onKeyDown,
    className,
  },
  ref,
) {
  if (variant === 'filled') {
    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={active}
        tabIndex={tabIndex}
        onClick={onClick}
        onKeyDown={onKeyDown}
        className={`rounded-m flex h-12 flex-col items-center justify-between px-2 pt-3 transition-colors active:bg-neutral-100 motion-reduce:transition-none ${className ?? ''}`.trim()}
      >
        <span
          className={`text-heading-5 flex w-full items-center justify-between whitespace-nowrap ${active ? 'text-fg' : 'text-fg-secondary'}`}
        >
          <span>{label}</span>
          {count !== undefined ? <span>{count}</span> : null}
        </span>
        {active ? <span className="bg-fg h-0.5 w-full shrink-0" /> : null}
      </button>
    );
  }

  const colorClassName = active ? TONE_CLASSNAME[tone] : 'border-transparent text-fg-secondary';

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={active}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`flex h-11 min-w-11 shrink-0 items-center justify-center border-b-2 px-2 whitespace-nowrap transition-colors motion-reduce:transition-none ${colorClassName} ${SIZE_CLASSNAME[size]} ${className ?? ''}`.trim()}
    >
      {label}
    </button>
  );
});
