'use client';

/**
 * 모달/바텀시트 닫기 버튼 (Figma "Close Button", node 2529-7362).
 * 62px 고정 너비는 4px 스케일에 안 맞아 `--width-close-button` 토큰(globals.css)으로 등록했다.
 */
export interface CloseButtonProps {
  onClick?: () => void;
  className?: string;
}

export function CloseButton({ onClick, className }: CloseButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'bg-surface border-border text-heading-2 text-fg w-close-button inline-flex h-12 items-center justify-center rounded-full border',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      닫기
    </button>
  );
}
