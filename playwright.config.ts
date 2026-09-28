import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 설정. 브라우저로 실제 로그인→장바구니 담기 흐름을 검증한다.
 *
 * 인증: 이 앱의 로그인은 실제 네이버/카카오 OAuth라 테스트 계정·자격증명이 없다
 * (CI/스크립트에서 자동화 불가). 그래서 `setup` 프로젝트(`e2e/auth.setup.ts`)를
 * 사람이 한 번 헤드풀 모드로 돌려 직접 로그인하고(`npm run e2e:login`), 그 결과
 * 세션(storageState)을 `e2e/.auth/user.json`에 저장해 재사용한다 — 표준 Playwright
 * "인증 상태 재사용" 패턴(https://playwright.dev/docs/auth). 이 파일은 refresh_token을
 * 담고 있어 .gitignore 처리됐고, 커밋되지 않는다. CI에서 돌리려면 별도 테스트 계정과
 * OAuth 우회 수단이 먼저 필요하다(아직 없음).
 *
 * `chromium` 프로젝트가 `setup`에 자동 의존(`dependencies`)하지 않는다 — Playwright의
 * dependencies는 매 실행마다 무조건 재실행되는데, `setup`은 헤드풀+사람 개입이 필요해
 * 무인 실행(`npm run e2e`)에 넣으면 항상 멈춰버린다. 그래서 `setup`은
 * `npm run e2e:login`으로 필요할 때만 수동 실행하고, `npm run e2e`는 이미 저장된
 * `e2e/.auth/user.json`을 그대로 재사용한다.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium',
      testIgnore: /auth\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
    },
  ],
});
