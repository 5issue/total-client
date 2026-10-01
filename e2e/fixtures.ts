import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, runWithPage) => {
    await page.goto('/');
    // access 만료 시 privateFetch 401을 줄이려 시도한다. 실패해도 storageState 쿠키로 진행한다.
    await page.request.post('/api/auth/refresh').catch(() => undefined);
    await runWithPage(page);
  },
});

export { expect } from '@playwright/test';
