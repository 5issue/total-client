'use client';

import type { ButtonHTMLAttributes } from 'react';

/**
 * 바로가기 태그 (Figma "Chip", node 3235-4368/4370, State=Default/Pressed —
 * Disabled 상태는 디자인에 없어 만들지 않는다, structure-convention §6-1).
 * 다른 Chip 계열과 달리 radius 가 pill(9999) 이 아니라 8px(`rounded-m`) — 별도 atom.
 * 너비 73px 은 4px 스케일에 안 맞아 `--width-shortcut-chip` 토큰(globals.css)으로 등록했다.
 */
export interface ShortcutChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: string;
}

export function ShortcutChip({
  children,
  className,
  type = 'button',
  ...props
}: ShortcutChipProps) {
  return (
    <button
      type={type}
      className={[
        'rounded-m border-border text-body-l text-fg active:bg-surface-secondary w-shortcut-chip inline-flex h-8 items-center justify-center gap-1 border p-1 whitespace-nowrap transition-colors motion-reduce:transition-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
