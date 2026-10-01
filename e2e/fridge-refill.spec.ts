import { expect, test } from '@playwright/test';

/**
 * 핵심 시나리오 2 — My냉장고 "채워넣기" → 장바구니 담기.
 *
 * `/api/fridge`(냉장고 목록)는 AI 서비스(FastAPI, 8000)가 있어야 응답한다 — 로컬/CI엔
 * 그 서비스가 없어 `page.route`로 우리 BFF의 응답만 목킹한다(원본 AI 응답이 아니라
 * `/api/fridge` Route Handler가 이미 정규화한 { statusCode, message, data } 봉투,
 * apiResponse.ts `ok()` 참고). GROUP id 103은 실 product-service에 있고 units[0].id가
 * 303 — 이 값으로 "채워넣기" 시트가 실제 UNIT id를 조회해 담는지까지 검증한다(이슈 #145,
 * FridgeRefillBottomSheet의 GROUP→UNIT 변환 + 이번에 고친 에러 토스트 위치 버그의
 * 회귀 테스트도 겸한다).
 */
test('My냉장고 채워넣기 → GROUP→UNIT 변환 → 장바구니 담기', async ({ page }) => {
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
              product: { product_id: '103', name: '한우 1++ 안심 300g', storage_type: 'FROZEN' },
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
  await expect(page.getByText('한우 1++ 안심 300g')).toBeVisible();

  await page.getByRole('button', { name: '채워넣기' }).click();
  const refillSheet = page.getByRole('dialog', { name: '채워넣기' });
  await expect(refillSheet).toBeVisible();

  // GROUP(103)→UNIT(303) 변환이 끝나야 담기 버튼이 활성화된다 — 조회 전엔 disabled.
  const addButton = refillSheet.getByRole('button', { name: '장바구니 담기' });
  await expect(addButton).toBeEnabled({ timeout: 10_000 });

  // 이번에 고친 버그: 시트를 열자마자 실패 안 했는데도 에러 토스트가 보이면 안 된다.
  await expect(page.getByText('장바구니 담기에 실패했어요')).toBeHidden();

  const addToCartResponse = page.waitForResponse(
    (res) => res.url().includes('/api/cart/items') && res.request().method() === 'POST',
  );
  await addButton.click();
  const response = await addToCartResponse;
  expect(response.status()).toBe(200);
  expect(response.request().postDataJSON()).toEqual({ items: [{ productId: 303, quantity: 1 }] });

  await page.goto('/cart');
  await expect(page.getByText('한우 1++ 안심 300g')).toBeVisible();
});
