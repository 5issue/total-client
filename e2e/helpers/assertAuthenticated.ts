import { expect, type Page } from '@playwright/test';

/** middleware 가 `/login`으로 보냈으면 세션 만료·누락 — `npm run e2e:login` 안내. */
export async function expectAuthenticated(page: Page) {
  if (page.url().includes('/login')) {
    throw new Error(
      'E2E: 로그인 페이지로 리다이렉트됐습니다. `npm run e2e:login`으로 e2e/.auth/user.json을 다시 만드세요. ' +
        '(이전에 E2E에서 `/api/auth/refresh`가 401이면 refresh_token 쿠키가 삭제됩니다.)',
    );
  }
  await expect(page.getByRole('heading', { name: '로그인을 해주세요!' })).toBeHidden();
}
