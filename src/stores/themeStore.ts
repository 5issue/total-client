import { createStore } from 'zustand/vanilla';

/**
 * 다크/라이트 테마 스토어 — 헤더 토글(마이컬리 화면, Figma node 1691-205422)에서 시작.
 * 전역(`<html>`)이 아니라 지금은 마이컬리 서브트리로 스코프가 좁혀져 있다(2026-09-18,
 * "우선 마이컬리만" 결정) — 실제 테마 적용은 `ThemeScope`(molecules/shared/ThemeScope)
 * 가 이 스토어를 읽어 자기 자신에 `data-theme` 를 붙이는 방식(globals.css
 * `@custom-variant dark` + `tokens/color.css` `[data-theme="dark"]`). 이 스토어는
 * `document`/DOM 을 직접 건드리지 않는다 — 어디에 적용할지는 값을 읽는 컴포넌트
 * (ThemeScope)에 맡긴다(나중에 `<html>` 에 붙이면 전역 전환도 그대로 가능).
 *
 * 앱을 새로 열면 항상 라이트로 시작한다(2026-09-18 결정) — 이전 세션 토글이나 OS
 * 다크 선호를 기억/복원하지 않는다. 그래서 localStorage 영속화가 없다: `toggleTheme`
 * 은 메모리 상태만 바꾸고, 새로고침/재실행하면 이 모듈의 초기값('light')으로 되돌아간다.
 *
 * 모듈 최상단 create() 싱글턴 금지 원칙은 여기서도 동일 — 팩토리만 정의, Provider 가 인스턴스화.
 */
export type Theme = 'light' | 'dark';

export type ThemeState = {
  theme: Theme;
};

export type ThemeActions = {
  toggleTheme: () => void;
};

export type ThemeStore = ThemeState & ThemeActions;

/** 항상 'light' 로 시작 — 앱을 새로 열 때마다 기본 모드를 보장한다. */
export const createThemeStore = (initTheme: Theme = 'light') =>
  createStore<ThemeStore>()((set, get) => ({
    theme: initTheme,
    toggleTheme: () => {
      const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
      set({ theme: next });
    },
  }));

export type ThemeStoreApi = ReturnType<typeof createThemeStore>;
