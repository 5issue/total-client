import type { ReactNode } from 'react';

/**
 * (auth) 셸 — 로그인/회원가입. 모바일 폭으로 고정한 세로 프레임만 제공한다.
 * (shop) 과 달리 Header/BottomNav 는 없다(각 화면이 필요 시 organism 을 직접 조립).
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface mx-auto flex min-h-dvh max-w-screen-sm flex-col">{children}</div>
  );
}
