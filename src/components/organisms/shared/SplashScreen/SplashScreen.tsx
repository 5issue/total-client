'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

import { Logo } from '@/components/atoms/Logo';

type Phase = 'visible' | 'fading' | 'hidden';

const VISIBLE_DURATION_MS = 1500;
const FADE_DURATION_MS = 300;

/** 같은 브라우저 탭(세션) 안에서 한 번 봤으면 다시 안 보여준다 — sessionStorage라
 * 탭을 닫으면(새 세션) 초기화된다. */
const SESSION_SHOWN_KEY = 'splash-shown';

/** 구독할 대상이 없다(세션 내내 값이 바뀌지 않는다) — `useSyncExternalStore` 계약상
 * 구독 함수 자체는 필수라 아무 것도 안 하는 빈 구독을 둔다. */
function subscribe() {
  return () => {};
}

/** 클라이언트 전용 — 세션에서 이미 본 적 있으면 true. `sessionStorage` 접근이 막힌
 * 환경(시크릿 모드 설정 등)이면 "못 봤다"로 보고 평소처럼 보여준다. */
function getSnapshot(): boolean {
  try {
    return sessionStorage.getItem(SESSION_SHOWN_KEY) != null;
  } catch {
    return false;
  }
}

/** SSR은 항상 "아직 안 봤음" — 하이드레이션 시점에 서버 렌더와 어긋나지 않게 한다. */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * 앱 최초 진입 시 노출되는 풀스크린 스플래시. Figma "5팀 디자인 시스템" — node 577-13109
 * "SplashScreen"(퍼플 배경 + Kurly 워드마크 중앙 정렬, 상태값 Default 1개뿐 — structure
 * §6-1, 노출 시간/전환 방식은 디자인 핸드오프에 없어 FE 가 기존 트랜지션 duration(300ms,
 * `--animate-slide-up`과 동일)에 맞춰 정했다).
 *
 * `app/layout.tsx` 가 `children` 과 나란히 한 번만 렌더한다 — "루트 레이아웃은 하드
 * 내비게이션에만 다시 실행된다"고 가정하고 한동안 세션 플래그 없이 뒀는데, 실제로는
 * 화면 전환마다 반복 노출돼("너무 정신없다" 리포트, 2026-10-01) 그 가정이 틀렸던 것으로
 * 확인됐다 — `sessionStorage`로 같은 탭에서는 한 번만 보이게 막는다.
 *
 * `useSyncExternalStore`로 읽는다 — `getServerSnapshot`이 항상 `false`라 SSR·클라
 * 첫 렌더(하이드레이션)가 항상 일치해 불일치 경고가 없고, 하이드레이션 직후 실제
 * `sessionStorage` 값과 다르면 React가 알아서 다시 그려준다(수동으로 effect 안에서
 * `setState` 하지 않아도 된다 — `react-hooks/set-state-in-effect` 와도 충돌 안 함).
 * 이미 본 세션이면 그 리렌더가 페인트 전에 끝나 스플래시가 눈에 보이지 않는다.
 *
 * 고정 시간 후 opacity 전환으로 사라지고, 전환이 끝나면 완전히 언마운트해 DOM/접근성
 * 트리에서 제거한다(`pointer-events-none`만으로는 스크린리더가 계속 읽는다).
 */
export function SplashScreen() {
  const alreadyShownThisSession = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [phase, setPhase] = useState<Phase>('visible');

  useEffect(() => {
    if (alreadyShownThisSession) return;
    try {
      sessionStorage.setItem(SESSION_SHOWN_KEY, '1');
    } catch {
      // 접근 불가면 그냥 매번 보여주는 쪽으로 둔다 — 표시 자체는 이미 정상 진행 중이다.
    }
  }, [alreadyShownThisSession]);

  useEffect(() => {
    if (alreadyShownThisSession || phase !== 'visible') return;
    const fadeTimer = setTimeout(() => setPhase('fading'), VISIBLE_DURATION_MS);
    return () => clearTimeout(fadeTimer);
  }, [alreadyShownThisSession, phase]);

  useEffect(() => {
    if (phase !== 'fading') return;
    const hideTimer = setTimeout(() => setPhase('hidden'), FADE_DURATION_MS);
    return () => clearTimeout(hideTimer);
  }, [phase]);

  if (alreadyShownThisSession || phase === 'hidden') return null;

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
