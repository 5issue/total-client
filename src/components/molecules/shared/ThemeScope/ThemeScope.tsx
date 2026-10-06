'use client';

import type { ReactNode } from 'react';

import { useThemeStore } from '@/hooks/useThemeStore';

/**
 * 다크모드 적용 범위를 이 wrapper 의 하위 트리로 제한한다 — 지금은 마이컬리 화면에서만
 * 쓴다(2026-09-18, "우선 마이컬리만" 결정). `<html>` 전역이 아니라 이 `data-theme`
 * 속성이 실제 스코프다(`tokens/color.css`가 `[data-theme='dark']`를 root 와 함께
 * 매칭하도록 넓혀 뒀다). 다른 화면도 다크가 검증되면 그 화면도 이걸로 감싸거나,
 * 아예 `<html>`에 옮겨 전역 전환하면 된다(선택자는 이미 둘 다 지원).
 *
 * 복원 로직이 없어(themeStore 문서 참고) SSR·클라 첫 렌더 모두 항상 'light' — 서버/클라
 * 출력이 항상 같아 하이드레이션 불일치가 날 수 없다(`suppressHydrationWarning` 불필요).
 *
 * `bg-bg`/`text-fg` 를 여기서 직접 깐다 — 원래 `<html>/<body>` 전역 배경·글자색
 * (globals.css `html,body{background-color/color}`)이 페이지 기본값을 책임졌지만,
 * 다크가 이 wrapper 로 스코프되면서 `<body>` 는 항상 라이트로 고정됐다.
 *   - 배경: 개별 섹션(예: `ShoppingLinksSection` 링크 목록)이 자기 배경을 안 그리고
 *     "페이지 배경이 알아서 깔려있겠지" 하고 비워두는 경우가 많아, 여기서 안 깔면 그
 *     빈 구간이 다크에서도 흰색으로 비쳐 보인다(실기기 스크린샷으로 발견, 2026-09-18).
 *   - 글자색: `themable:true` 아이콘(`currentColor` fill/stroke)은 `text-fg` 를 직접
 *     안 받으면 `color` 를 상속하는데, 상속 원점이 이제 `<body>`(항상 라이트, #222)라
 *     다크 페이지 배경(#222)과 완전히 같은 색이 돼 안 보인다(Quick_Menu 아이콘 전멸
 *     버그, 2026-09-18) — 여기서 `text-fg` 를 다시 선언해 상속 원점을 스코프 안으로
 *     되돌린다.
 */
export function ThemeScope({ children, className }: { children: ReactNode; className?: string }) {
  const theme = useThemeStore((s) => s.theme);

  return (
    <div data-theme={theme} className={['bg-bg', 'text-fg', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
