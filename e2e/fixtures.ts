import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, runWithPage) => {
    await page.goto('/');
    if (page.url().includes('/login')) {
      throw new Error(
        'E2E: refresh_token 쿠키가 없습니다. `npm run e2e:login`으로 e2e/.auth/user.json을 만든 뒤 다시 실행하세요. ' +
          '(예전 E2E fixture의 `/api/auth/refresh` 401 호출로 쿠키가 지워졌을 수 있습니다.)',
      );
    }
    await runWithPage(page);
  },
});

export { expect } from '@playwright/test';
