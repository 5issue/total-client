'use client';

import { Icon } from '@/components/atoms/Icon';
import { useThemeStore } from '@/hooks/useThemeStore';

/**
 * 다크/라이트 전역 테마 토글 (molecule). Figma "Toggle_Mode" — 라이트(node 910-110970)
 * 와 다크(node 1691-205512) 둘 다 실측 존재(2026-09-18 라이트 스펙 확인 전엔 대칭
 * 반전으로 유추했었다 — 이제 둘 다 실제 값).
 *
 * 트랙 56×28, 노브 24×24. 트랙 색은 둘 다 프리미티브 고정값(`--icon/disabled` 라이트
 * `#c9d5df`(neutral-400) / 다크 `#515e69`(neutral-900))이라 시맨틱 토큰이 아니라
 * `bg-neutral-400`/`bg-neutral-900`으로 그대로 쓴다. 노브 배경은 `bg-bg` — 다크에서
 * 페이지 배경과 같은 값(#222)이라 "파여 보이는" 노브, 라이트에선 흰색.
 * 노브 아이콘: 라이트 `sun`(기존 아이콘 재사용 — 원래 고정 주황 `#F2774E` 였는데
 * currentColor 로 바꾸고 `text-primary` 를 입혀 Brand/Primary 로 낸다, 아이콘 자체가
 * Figma 실측과 모양이 100% 동일해 새로 안 만들었다), 다크 `moon`(Figma 가 고정
 * 브랜드색으로 export, themable 아님 — 대응되는 기존 아이콘이 없어 새로 추가).
 *
 * 실제 테마 전환은 `useThemeStore`(전역 Zustand, `<html data-theme>` 직접 반영) — 이
 * 컴포넌트는 상태만 읽고 클릭을 스토어에 위임한다.
 *
 * 시각 트랙(56×28)과 실제 터치 영역을 분리했다 — 트랙 그대로를 `button` 크기로 쓰면
 * 세로가 28px라 최소 터치 타깃 44px(code-style §5)에 못 미친다(코드래빗 리뷰).
 * `button` 은 56×44 로 두고 트랙(가운데 정렬된 `span`)은 Figma 실측 크기 그대로 유지한다.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      onClick={toggleTheme}
      className={['flex h-11 w-14 items-center', className].filter(Boolean).join(' ')}
    >
      <span
        className={[
          'flex h-7 w-14 items-center rounded-full px-1 transition-colors duration-200 motion-reduce:transition-none',
          isDark ? 'justify-end bg-neutral-900' : 'justify-start bg-neutral-400',
        ].join(' ')}
      >
        <span className="bg-bg flex size-6 items-center justify-center rounded-full">
          <Icon
            name={isDark ? 'moon' : 'sun'}
            size={20}
            aria-hidden
            className={isDark ? undefined : 'text-primary'}
          />
        </span>
      </span>
    </button>
  );
}
