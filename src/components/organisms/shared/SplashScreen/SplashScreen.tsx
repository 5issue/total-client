'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

import { Logo } from '@/components/atoms/Logo';

import { SPLASH_BOOT_ID, SPLASH_SHOWN_KEY } from './splashSession';

type Phase = 'visible' | 'fading' | 'hidden';

const VISIBLE_DURATION_MS = 1500;
const FADE_DURATION_MS = 300;

/** 구독할 대상이 없다 — `useSyncExternalStore` 계약상 구독 함수는 필수라 빈 구독을 둔다. */
function subscribe() {
  return () => {};
}

/** 이 탭에서 이미 봤으면 true. 저장소 접근이 막히면 "못 봤다"로 보고 보여준다. */
function getSnapshot(): boolean {
  try {
    return sessionStorage.getItem(SPLASH_SHOWN_KEY) != null;
  } catch {
    return false;
  }
}

/**
 * 서버(와 하이드레이션 첫 렌더)는 항상 "이미 봄" — 스플래시 DOM을 HTML에 넣지 않는다.
 * 안 본 세션이면 클라 스냅샷과 달라져 하이드레이션 직후 스플래시가 붙는다.
 * 매 응답에 스플래시를 그리면, JS가 세션 값을 읽기 전에 화면 이동마다 한 번씩 보인다.
 */
function getServerSnapshot(): boolean {
  return true;
}

function markSeenSoon() {
  // Strict Mode가 effect를 바로 치우고 다시 마운트한다. 그 전에 저장하면
  // 재마운트가 "이미 본 세션"으로 읽어 첫 진입 스플래시가 개발 모드에서 사라진다.
  // 타이머를 치우면 저장이 다음 effect로 넘어가고, 실제 화면 이동은 그 뒤에야 일어난다.
  const markTimer = setTimeout(() => {
    try {
      sessionStorage.setItem(SPLASH_SHOWN_KEY, '1');
    } catch {
      // 접근 불가면 매번 보여주는 쪽으로 둔다.
    }
  }, 0);
  return () => clearTimeout(markTimer);
}

function removeBootCover() {
  document.getElementById(SPLASH_BOOT_ID)?.remove();
}

/**
 * 앱 최초 진입 시 노출되는 풀스크린 스플래시. Figma "5팀 디자인 시스템" — node 577-13109
 * "SplashScreen"(퍼플 배경 + Kurly 워드마크 중앙 정렬, 상태값 Default 1개뿐 — structure
 * §6-1, 노출 시간/전환 방식은 디자인 핸드오프에 없어 FE 가 기존 트랜지션 duration(300ms,
 * `--animate-slide-up`과 동일)에 맞춰 정했다).
 *
 * `sessionStorage`로 같은 탭에서는 한 번만 보이게 한다. 새로고침·화면 이동은 같은
 * 세션이라 나오지 않고, 탭을 닫거나 브라우저를 완전히 종료한 뒤에만 다시 나온다.
 *
 * 서버 HTML에는 스플래시를 넣지 않는다. 루트 레이아웃 스크립트가 아직 안 본 세션에만
 * 같은 색 막을 먼저 씌우고, 이 컴포넌트가 로고 스플래시로 이어받은 뒤 막을 걷는다.
 */
export function SplashScreen() {
  const alreadyShownThisSession = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [phase, setPhase] = useState<Phase>('visible');

  useEffect(() => {
    if (alreadyShownThisSession) {
      removeBootCover();
      return;
    }
    return markSeenSoon();
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

  useEffect(() => {
    if (phase === 'hidden') removeBootCover();
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
