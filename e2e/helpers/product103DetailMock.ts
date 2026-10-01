import type { Page } from '@playwright/test';

/** E2E 공통 — GROUP 103 / UNIT 303(한우 1++ 안심 300g). 시드에 units가 비어 있어도 담기 CTA·채워넣기 변환을 검증한다. */
export const PRODUCT_103_NAME = '한우 1++ 안심 300g';
export const PRODUCT_103_GROUP_ID = 103;
export const PRODUCT_103_UNIT_ID = 303;

const PRODUCT_103_DETAIL = {
  id: PRODUCT_103_GROUP_ID,
  name: PRODUCT_103_NAME,
  shortDescription: 'E2E fixture',
  brand: 'E2E',
  price: 59_900,
  salePrice: 49_900,
  discountRate: 17,
  status: 'SALE' as const,
  media: [{ mediaUrl: '/graphic-icons/cart-badge.webp', mediaRole: 'THUMBNAIL' as const }],
  spec: null,
  units: [
    {
      id: PRODUCT_103_UNIT_ID,
      name: PRODUCT_103_NAME,
      price: 59_900,
      salePrice: 49_900,
      status: 'SALE' as const,
    },
  ],
};

/** BFF `GET /api/products/103` — product-service 시드 변동과 무관하게 단일 UNIT 담기 전제를 유지한다. */
export async function mockProduct103Detail(page: Page) {
  await page.route('**/api/products/103', async (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        statusCode: 200,
        message: 'OK',
        data: PRODUCT_103_DETAIL,
      }),
    });
  });
}

/** 카드 제목 `<p>`만 매칭 — 체크박스 sr-only「… 선택」과 strict mode 충돌 방지(MyFridgeView.stories 동일). */
export function productNameOnPage(page: Page, name: string = PRODUCT_103_NAME) {
  return page.getByText(name, { exact: true }).and(page.locator('p'));
}
