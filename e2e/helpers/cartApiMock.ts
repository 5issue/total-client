import type { Page, Route } from '@playwright/test';

import { PRODUCT_103_NAME, PRODUCT_103_UNIT_ID } from './product103DetailMock';

/** `CartResponseSchema` 최소 스냅샷 — BFF `ok()` 봉투로 내려준다. */
function buildCartEnvelope(items: Array<{ productId: number; title: string; quantity: number }>) {
  const cartItems = items.map((item, index) => ({
    cartItemId: 9000 + index,
    productId: item.productId,
    skuId: item.productId,
    title: item.title,
    thumbnailUrl: null,
    unitPrice: 49_900,
    quantity: item.quantity,
    maxQuantity: 10,
    available: true,
  }));

  const totalItemAmount = cartItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  return {
    statusCode: 200,
    message: 'OK',
    data: {
      selectedAddress: null,
      groups: [
        {
          deliveryType: 'DAWN' as const,
          temperatureType: 'FROZEN' as const,
          seller: null,
          items: cartItems,
          groupItemAmount: totalItemAmount,
          groupDeliveryFee: 0,
        },
      ],
      amountSummary: {
        totalItemAmount,
        discountAmount: 0,
        deliveryFee: 0,
        paymentAmount: totalItemAmount,
      },
    },
  };
}

let lastAddedItems: Array<{ productId: number; quantity: number }> = [];

function cartPathname(url: string) {
  return new URL(url).pathname.replace(/\/$/, '');
}

/** 담기 POST·장바구니 GET을 mock — invalidate refetch가 실 API 401→refresh→쿠키 삭제 되지 않게 한다. */
export async function mockCartItemsApi(page: Page) {
  lastAddedItems = [];

  async function handlePost(route: Route) {
    const body = route.request().postDataJSON() as {
      items: Array<{ productId: number; quantity: number }>;
    };
    lastAddedItems = body.items;
    const envelope = buildCartEnvelope(
      body.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        title:
          item.productId === PRODUCT_103_UNIT_ID ? PRODUCT_103_NAME : `product-${item.productId}`,
      })),
    );
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(envelope),
    });
  }

  async function handleGet(route: Route) {
    const items =
      lastAddedItems.length > 0
        ? lastAddedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            title:
              item.productId === PRODUCT_103_UNIT_ID
                ? PRODUCT_103_NAME
                : `product-${item.productId}`,
          }))
        : [
            {
              productId: PRODUCT_103_UNIT_ID,
              quantity: 1,
              title: PRODUCT_103_NAME,
            },
          ];
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(buildCartEnvelope(items)),
    });
  }

  await page.route('**/api/cart**', async (route) => {
    const req = route.request();
    const path = cartPathname(req.url());

    if (path.endsWith('/api/cart/items') && req.method() === 'POST') {
      await handlePost(route);
      return;
    }
    if (path.endsWith('/api/cart') && req.method() === 'GET') {
      await handleGet(route);
      return;
    }
    await route.continue();
  });
}

export function getLastCartAddPayload() {
  return lastAddedItems;
}
