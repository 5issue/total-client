import path from 'node:path';

import { test as setup } from '@playwright/test';

/**
 * 로그인 세션을 한 번 만들어 재사용하기 위한 셋업 — `npm run e2e:login`(헤드풀)으로
 * 사람이 직접 실행한다. `npm run e2e`(무인 실행)에는 절대 포함되지 않는다
 * (playwright.config.ts 참고) — 실제 네이버/카카오 OAuth라 스크립트로 완료할 수 없다.
 *
 * "네이버로 계속하기"를 누른 뒤 실제 네이버 로그인 화면으로 넘어가면, 그 창에서
 * 사람이 직접 로그인을 마쳐야 한다. 우리 앱(`/`)으로 돌아오는 걸 최대 2분 기다린다.
 */
const authFile = path.join(__dirname, '.auth/user.json');

setup('네이버 로그인 후 세션 저장', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: '네이버로 계속하기' }).click();

  // "/login" 자체도 "localhost:3000/**"에 걸려 즉시 통과해버렸던 첫 버전의 버그를
  // 피하려고, 먼저 네이버 도메인으로 실제로 떠났는지부터 확인한다.
  await page.waitForURL((url) => url.hostname !== 'localhost', { timeout: 30_000 });

  // 콜백(`/callback/naver`) → 홈(`/`)으로 돌아올 때까지(사람이 직접 로그인) 대기.
  // 정확히 루트만 매칭 — "/login"처럼 즉시 참이 되는 패턴을 다시 만들지 않는다.
  await page.waitForURL('http://localhost:3000/', { timeout: 120_000 });

  await page.context().storageState({ path: authFile });
});
