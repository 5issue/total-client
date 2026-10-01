import { expect, test } from '@playwright/test';

/**
 * 핵심 시나리오 1 — 상품 상세에서 장바구니 담기.
 * 상품 103(한우 1++ 안심 300g)은 옵션(unit)이 하나라 `ProductOptionSheet`(단일 옵션
 * 시트)로 열린다. 실 백엔드로 `POST /api/cart/items`가 성공하는지, 완료 시트가
 * 뜨는지, 장바구니 페이지에 실제로 반영되는지까지 확인한다(이슈 #143).
 */
test('상품 상세 → 장바구니 담기 → 장바구니 페이지 반영', async ({ page }) => {
  await page.goto('/products/103');

  await page.getByRole('button', { name: '장바구니 담기' }).first().click();

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
  await expect(page.getByText('한우 1++ 안심 300g')).toBeVisible();
});
