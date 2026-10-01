'use client';

import { useEffect, useState } from 'react';

import { Logo } from '@/components/atoms/Logo';

type Phase = 'visible' | 'fading' | 'hidden';

const VISIBLE_DURATION_MS = 1500;
const FADE_DURATION_MS = 300;

/**
 * 앱 최초 진입 시 노출되는 풀스크린 스플래시. Figma "5팀 디자인 시스템" — node 577-13109
 * "SplashScreen"(퍼플 배경 + Kurly 워드마크 중앙 정렬, 상태값 Default 1개뿐 — structure
 * §6-1, 노출 시간/전환 방식은 디자인 핸드오프에 없어 FE 가 기존 트랜지션 duration(300ms,
 * `--animate-slide-up`과 동일)에 맞춰 정했다).
 *
 * `app/layout.tsx` 가 `children` 과 나란히 한 번만 렌더한다 — 루트 레이아웃은 하드
 * 내비게이션에만 다시 실행되고 앱 내 라우트 전환으로는 재마운트되지 않아, 별도 라우트나
 * 세션 플래그 없이도 "진입 시 1회"라는 목적과 자연히 맞는다. 초기 상태가 SSR·클라
 * 첫 렌더 모두 항상 'visible'이라 하이드레이션 불일치도 없다 — 즉 JS 로드 전에도
 * 서버 HTML 자체에 이 커튼이 덮여 있어, 그 아래 이미 렌더된 콘텐츠가 빈 화면/깜빡임
 * 없이 자연스럽게 드러난다(이슈 #185 필요성).
 *
 * 고정 시간 후 opacity 전환으로 사라지고, 전환이 끝나면 완전히 언마운트해 DOM/접근성
 * 트리에서 제거한다(`pointer-events-none`만으로는 스크린리더가 계속 읽는다).
 */
export function SplashScreen() {
  const [phase, setPhase] = useState<Phase>('visible');

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase('fading'), VISIBLE_DURATION_MS);
    return () => clearTimeout(fadeTimer);
  }, []);

  useEffect(() => {
    if (phase !== 'fading') return;
    const hideTimer = setTimeout(() => setPhase('hidden'), FADE_DURATION_MS);
    return () => clearTimeout(hideTimer);
  }, [phase]);

  if (phase === 'hidden') return null;

  return (
    <div
      aria-hidden
      className={`bg-brand-secondary z-splash fixed inset-0 flex items-center justify-center transition-opacity duration-300 motion-reduce:transition-none ${
        phase === 'fading' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <Logo name="kurly-l" height={88} aria-hidden />
    </div>
  );
}
