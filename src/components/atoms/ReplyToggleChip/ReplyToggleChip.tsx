'use client';

/**
 * 리뷰/댓글 답글 펼침 토글 (Figma "Chip", node 3235-4373/4375/4377,
 * Property1=Default/Pressed/Selected — Disabled 상태는 디자인에 없어 만들지 않는다,
 * structure-convention §6-1). 시각 라벨은 "ㄴ" 고정 글리프라 accessible
 * name 은 항상 `aria-label` 로 대체한다(children 없음).
 *
 * Pressed 스펙(Figma 코드 패널 확인): border-radius full(기존과 동일),
 * background Surface/Neutral_Mid(#B5C4CF) → `active:bg-neutral-500`.
 */
export interface ReplyToggleChipProps {
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ReplyToggleChip({ selected = false, onClick, className }: ReplyToggleChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={selected ? '답글 접기' : '답글 펼치기'}
      className={[
        'text-heading-5 inline-flex h-11 items-center justify-center rounded-full px-3 py-1 transition-colors motion-reduce:transition-none',
        selected
          ? 'text-fg-inverse bg-black'
          : 'bg-surface-secondary text-fg-quaternary active:bg-neutral-500',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      ㄴ
    </button>
  );
}
