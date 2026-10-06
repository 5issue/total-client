'use client';

import type { ReactNode } from 'react';

import { Icon } from '@/components/atoms/Icon/Icon';

/**
 * 태그/추천 리셋/삭제 가능 카테고리 칩 (Figma "Chip", node 2671-2776/2774(Basic),
 * 2672-2810/2812(Reset), 2707-5310(삭제 가능)). h-8 계열 — `RecommendedKeywordsContainer`
 * 에 인라인 하드코딩돼 있던 키워드/리셋 칩과 동일 스펙이라, 공용 atom 으로 승격했다.
 *
 * onRemove/onRefresh 유무로 3가지 모습을 하나의 컴포넌트에 담는다(atoms/Chip 의
 * onRemove 분기 패턴과 동일 방식). Pressed 상태는 실제 UI 상 클릭 시 순간적인
 * 피드백이라 prop 이 아니라 `active:` 로 표현한다.
 *
 * label-xs 트래킹(-0.01em)이 Figma 실측(-1px)과 정확히는 다르다 — atoms/Chip 의
 * 기존 SOLID_TEXT_CLASSNAME 주석과 같은 종류의 기지 차이(typography.css 재검증 필요).
 */
export interface TagChipProps {
  children: ReactNode;
  onClick?: () => void;
  /** 제공하면 "다시 추천 받기" 스타일(보더+새로고침 아이콘)로 렌더한다. */
  onRefresh?: () => void;
  /** 제공하면 삭제 가능한 카테고리 칩(연한 배경 + 삭제 X)으로 렌더한다. `onRefresh` 와 동시 사용 안 함. */
  onRemove?: () => void;
  className?: string;
}

export function TagChip({ children, onClick, onRefresh, onRemove, className }: TagChipProps) {
  if (onRemove) {
    const removeLabel = typeof children === 'string' ? `${children} 삭제` : '삭제';

    return (
      <span
        className={[
          'bg-surface-secondary text-label-l text-fg inline-flex h-8 items-center gap-1 rounded-full px-2 whitespace-nowrap',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="-m-1 shrink-0 rounded-full p-1"
        >
          <Icon name="close" size={20} aria-hidden />
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onRefresh ?? onClick}
      className={[
        'text-label-xs active:bg-overlay-blue inline-flex h-8 items-center justify-center gap-1 rounded-full border px-4 py-1 whitespace-nowrap transition-colors motion-reduce:transition-none',
        onRefresh
          ? 'border-primary text-primary bg-surface'
          : 'bg-surface text-fg active:border-border border-transparent',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
      {onRefresh ? <Icon name="refresh" size={20} aria-hidden /> : null}
    </button>
  );
}
