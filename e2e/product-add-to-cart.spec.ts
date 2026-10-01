import { expect, test } from '@playwright/test';

import { mockProduct103Detail, PRODUCT_103_NAME } from './helpers/product103DetailMock';

/**
 * 핵심 시나리오 1 — 상품 상세에서 장바구니 담기.
 * 상품 103(한우 1++ 안심 300g)은 옵션(unit)이 하나라 `ProductOptionSheet`(단일 옵션
 * 시트)로 열린다. `mockProduct103Detail`로 상세·UNIT을 고정하고, 실 백엔드로
 * `POST /api/cart/items`가 성공하는지, 완료 시트·장바구니 반영까지 확인한다(이슈 #143).
 */
test('상품 상세 → 장바구니 담기 → 장바구니 페이지 반영', async ({ page }) => {
  await mockProduct103Detail(page);

  await page.goto('/products/103');

  const cta = page.getByRole('button', { name: '장바구니 담기' }).first();
  await expect(cta).toBeEnabled({ timeout: 15_000 });
  await cta.click();

  const optionSheet = page.getByRole('dialog', { name: '장바구니 담기' });
  await expect(optionSheet).toBeVisible();

  const addToCartResponse = page.waitForResponse(
    (res) => res.url().includes('/api/cart/items') && res.request().method() === 'POST',
  );
  await optionSheet.getByRole('button', { name: '장바구니 담기' }).click();
  const response = await addToCartResponse;
  expect(response.status()).toBe(200);

  await expect(page.getByRole('dialog', { name: '장바구니 담기 완료' })).toBeVisible();

  await page.goto('/cart');
  await expect(page.getByText(PRODUCT_103_NAME).first()).toBeVisible();
});
