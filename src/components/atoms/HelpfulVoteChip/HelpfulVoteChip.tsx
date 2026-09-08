'use client';

import { Icon } from '@/components/atoms/Icon/Icon';

/**
 * 리뷰 "도움돼요" 투표 칩 (Figma "Chip", node 3235-4355/4359/4363,
 * Property1=Default/Pressed/Selected — Disabled 상태는 디자인에 없어 만들지 않는다,
 * structure-convention §6-1). 아이콘은 기존 `atoms/Icon` 의 `like`(outline, 같은 path)를
 * 재사용 — currentColor 라 `selected` 텍스트색만 바꾸면 아이콘도 같이 바뀐다.
 *
 * Pressed 스펙(Figma 코드 패널 확인): border-radius full, border 1px solid
 * Icon/Tertiary(#8AA1AB) → `border-neutral-700`, background Surface/Secondary(#F0F5F8)
 * → `active:bg-surface-secondary`. 보더는 Default/Selected 에서도 동일해 상시 클래스로 둔다.
 * `Property 1` 이 Default/Pressed/Selected 중 하나뿐인 단일 값이라(Selected+Pressed 조합
 * 없음), pressed 배경은 selected 가 아닐 때만 적용한다.
 */
export interface HelpfulVoteChipProps {
  selected?: boolean;
  count: number;
  onClick?: () => void;
  className?: string;
}

export function HelpfulVoteChip({
  selected = false,
  count,
  onClick,
  className,
}: HelpfulVoteChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        'text-caption-m inline-flex h-8 items-center justify-center gap-1 rounded-full border border-neutral-700 px-3 py-1 whitespace-nowrap transition-colors motion-reduce:transition-none',
        selected ? 'text-primary' : 'text-fg-secondary active:bg-surface-secondary',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Icon name="like" size={20} aria-hidden />
      도움돼요
      <span>{count}</span>
    </button>
  );
}
