'use client';

/**
 * 모달/바텀시트 닫기 버튼 (Figma "Close Button", node 2529-7362).
 * 62px 고정 너비는 Tailwind 4px 스케일에 맞지 않는 실측값이라 임의값(`w-[62px]`)을 그대로 쓴다.
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
        'bg-surface border-border text-heading-2 text-fg inline-flex h-12 w-[62px] items-center justify-center rounded-full border',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      닫기
    </button>
  );
}
