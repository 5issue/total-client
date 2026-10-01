import { expect, test } from './fixtures';
import { mockCartItemsApi } from './helpers/cartApiMock';
import {
  mockProduct103Detail,
  PRODUCT_103_NAME,
  PRODUCT_103_UNIT_ID,
  productNameOnPage,
} from './helpers/product103DetailMock';

/**
 * 핵심 시나리오 2 — My냉장고 "채워넣기" → 장바구니 담기.
 *
 * `/api/fridge`는 AI(8000) 없을 때 route mock. GROUP 103 상세·장바구니 POST/GET은
 * BFF mock으로 시드·401 변동과 분리하고, 요청 본문(GROUP→UNIT 303)과 UI만 검증한다.
 */
test('My냉장고 채워넣기 → GROUP→UNIT 변환 → 장바구니 담기', async ({ page }) => {
  await mockProduct103Detail(page);
  await mockCartItemsApi(page);

  await page.route('**/api/fridge', async (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        statusCode: 200,
        message: 'OK',
        data: {
          items: [
            {
              product: { product_id: '103', name: PRODUCT_103_NAME, storage_type: 'FROZEN' },
              ingredients: [],
              quantity: 1,
              unit: '개',
              expires_at: new Date(Date.now() + 2 * 86_400_000).toISOString(),
              is_expired: false,
            },
          ],
        },
      }),
    });
  });

  await page.goto('/mypage/fridge');
  await expect(productNameOnPage(page)).toBeVisible();

  await page.getByRole('button', { name: '채워넣기' }).click();
  const refillSheet = page.getByRole('dialog', { name: '채워넣기' });
  await expect(refillSheet).toBeVisible();

  const addButton = refillSheet.getByRole('button', { name: '장바구니 담기' });
  await expect(addButton).toBeEnabled({ timeout: 10_000 });

  const addToCartResponse = page.waitForResponse(
    (res) => res.url().includes('/api/cart/items') && res.request().method() === 'POST',
  );
  await addButton.click();
  const response = await addToCartResponse;
  expect(response.status()).toBe(200);
  expect(response.request().postDataJSON()).toEqual({
    items: [{ productId: PRODUCT_103_UNIT_ID, quantity: 1 }],
  });

  await expect(page.getByRole('dialog', { name: '장바구니 담기 완료' })).toBeVisible();

  await page.goto('/cart');
  await expect(page.getByText(PRODUCT_103_NAME).first()).toBeVisible();
});
