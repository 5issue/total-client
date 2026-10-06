'use client';

import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'recent-searches';
const MAX_COUNT = 20;

type Listener = () => void;

const listeners = new Set<Listener>();
const EMPTY_KEYWORDS: string[] = [];
let cachedKeywords: string[] = EMPTY_KEYWORDS;
let initialized = false;

function readFromStorage(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeToStorage(next: string[]) {
  cachedKeywords = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 저장 실패(시크릿 모드 등)해도 화면 상태는 그대로 유지한다.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  // 클라이언트 첫 호출에서만 localStorage 를 읽어 캐시를 채운다 — 이후엔 같은
  // 참조를 반환해야 useSyncExternalStore 가 불필요한 리렌더를 안 만든다.
  if (!initialized && typeof window !== 'undefined') {
    initialized = true;
    cachedKeywords = readFromStorage();
  }
  return cachedKeywords;
}

function getServerSnapshot() {
  // 매 호출마다 새 배열을 만들면 참조가 계속 바뀌어 React가 "스냅샷이 바뀌었다"고
  // 오인해 무한 루프에 빠진다(getServerSnapshot/getSnapshot 은 반드시 같은 참조를
  // 반환해야 함) — 고정된 빈 배열 하나를 공유해서 참조 안정성을 보장한다.
  return EMPTY_KEYWORDS;
}

/**
 * 최근 검색어 — localStorage 기반. 검색창(추가)과 최근 검색어 섹션(표시/삭제)이
 * 서로 다른 컴포넌트라 상태를 공유해야 하는데, 서버 상태(TanStack Query)도 전역
 * UI 상태(uiStore)도 아니라서 `useSyncExternalStore` 로 모듈 단위 캐시를 공유하는
 * 이 훅 하나로 둔다(#69, Figma node 577-13977 "최근 검색어").
 *
 * 최신 검색어가 맨 앞에 오고, 같은 단어 재검색 시 중복 없이 맨 앞으로 이동한다.
 * 최대 20개까지만 보관 — Figma 스펙엔 개수 제한이 없지만 무한정 쌓이는 걸 막는
 * 상식적인 상한(페이지네이션이 끝없이 늘어나는 것도 방지).
 */
export function useRecentSearches() {
  const keywords = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addKeyword = useCallback((keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    const current = getSnapshot();
    const next = [trimmed, ...current.filter((k) => k !== trimmed)].slice(0, MAX_COUNT);
    writeToStorage(next);
  }, []);

  const removeKeyword = useCallback((keyword: string) => {
    const next = getSnapshot().filter((k) => k !== keyword);
    writeToStorage(next);
  }, []);

  return { keywords, addKeyword, removeKeyword };
}
