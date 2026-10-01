import { expect, test } from '@playwright/test';

import {
  mockProduct103Detail,
  PRODUCT_103_NAME,
  PRODUCT_103_UNIT_ID,
  productNameOnPage,
} from './helpers/product103DetailMock';

/**
 * 핵심 시나리오 2 — My냉장고 "채워넣기" → 장바구니 담기.
 *
 * `/api/fridge`(냉장고 목록)는 AI 서비스(FastAPI, 8000)가 있어야 응답한다 — 로컬/CI엔
 * 그 서비스가 없어 `page.route`로 우리 BFF의 응답만 목킹한다(원본 AI 응답이 아니라
 * `/api/fridge` Route Handler가 이미 정규화한 { statusCode, message, data } 봉투,
 * apiResponse.ts `ok()` 참고). GROUP id 103은 `mockProduct103Detail`로 UNIT 303을
 * 고정해 시드에 units가 비어 있어도 GROUP→UNIT 변환·담기를 검증한다(이슈 #145,
 * FridgeRefillBottomSheet + 에러 토스트 회귀).
 */
test('My냉장고 채워넣기 → GROUP→UNIT 변환 → 장바구니 담기', async ({ page }) => {
  await mockProduct103Detail(page);

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

  // 이번에 고친 버그: 시트를 연 직후(상세 조회 전·담기 클릭 전) 실패 토스트가 뜨면 안 된다.
  await expect(page.getByText('장바구니 담기에 실패했어요')).toBeHidden();

  // GROUP(103)→UNIT(303) 변환이 끝나야 담기 버튼이 활성화된다 — 조회 전엔 disabled.
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

  await page.goto('/cart');
  await expect(page.getByText(PRODUCT_103_NAME).first()).toBeVisible();
});
