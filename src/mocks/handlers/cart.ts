import { HttpResponse, http } from 'msw';

/**
 * Spring 장바구니 API 목킹. 경로·응답 형태는 이슈 #118 명세 그대로.
 * Route Handler 가 서버사이드로 호출하는 요청만 가로챈다(api-convention §3).
 *
 * 수량 변경·삭제가 실제로 다음 GET 에 반영되도록 모듈 레벨 mutable 배열로 상태를 유지한다 —
 * order 도메인 mock 과 달리 화면에서 눈에 보이는 변화를 직접 검증할 수 있게 하기 위함.
 */
const BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

function nowIso() {
  return new Date().toISOString();
}

interface MockCartItem {
  cartItemId: number;
  productId: number;
  skuId: number;
  name: string;
  thumbnailUrl: string | null;
  price: number;
  originalPrice: number | null;
  quantity: number;
  soldOut: boolean;
  temperature: 'REFRIGERATED' | 'FROZEN';
}

interface MockCartGroup {
  groupId: string;
  deliveryLabel: string;
  checked: boolean;
  shippingFee: number;
  items: MockCartItem[];
}

let mockCart: MockCartGroup[] = [
  {
    groupId: 'saetbyeol',
    deliveryLabel: '샛별배송',
    checked: true,
    shippingFee: 0,
    items: [
      {
        cartItemId: 2001,
        productId: 10,
        skuId: 1001,
        name: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
        thumbnailUrl: 'https://cdn.example.com/products/10.jpg',
        price: 2780,
        originalPrice: 3400,
        quantity: 1,
        soldOut: false,
        temperature: 'REFRIGERATED',
      },
      {
        cartItemId: 2002,
        productId: 11,
        skuId: 1002,
        name: "[Kurly's] 동물복지 유정란 20구",
        thumbnailUrl: 'https://cdn.example.com/products/11.jpg',
        price: 10051,
        originalPrice: 10580,
        quantity: 1,
        soldOut: false,
        temperature: 'REFRIGERATED',
      },
      {
        cartItemId: 2003,
        productId: 12,
        skuId: 1003,
        name: '바로먹는 아보카도 3입 (페루산)',
        thumbnailUrl: 'https://cdn.example.com/products/12.jpg',
        price: 9990,
        originalPrice: 13900,
        quantity: 1,
        soldOut: false,
        temperature: 'REFRIGERATED',
      },
      {
        cartItemId: 2004,
        productId: 13,
        skuId: 1004,
        name: '[풀무원] 동물복지 치킨 너겟 오리지널',
        thumbnailUrl: 'https://cdn.example.com/products/13.jpg',
        price: 7979,
        originalPrice: 8980,
        quantity: 1,
        soldOut: false,
        temperature: 'FROZEN',
      },
    ],
  },
];

export const cartHandlers = [
  // GET /api/v1/carts — 장바구니 조회
  http.get(`${BASE}/api/v1/carts`, () => {
    return HttpResponse.json({
      status: 'SUCCESS',
      message: '장바구니를 조회했습니다.',
      data: { groups: mockCart },
      error: null,
      timestamp: nowIso(),
    });
  }),

  // PATCH /api/v1/carts/items/{cartItemId} — 수량 변경
  http.patch(`${BASE}/api/v1/carts/items/:cartItemId`, async ({ params, request }) => {
    const cartItemId = Number(params.cartItemId);
    const body = (await request.json()) as { quantity?: number };

    if (!body.quantity || body.quantity < 1) {
      return HttpResponse.json(
        {
          status: 'ERROR',
          message: '수량이 올바르지 않습니다.',
          data: null,
          error: 'INVALID_QUANTITY',
          timestamp: nowIso(),
        },
        { status: 400 },
      );
    }

    let found = false;
    mockCart = mockCart.map((group) => ({
      ...group,
      items: group.items.map((item) => {
        if (item.cartItemId !== cartItemId) return item;
        found = true;
        return { ...item, quantity: body.quantity as number };
      }),
    }));

    if (!found) {
      return HttpResponse.json(
        {
          status: 'ERROR',
          message: '장바구니에서 상품을 찾을 수 없습니다.',
          data: null,
          error: 'CART_ITEM_NOT_FOUND',
          timestamp: nowIso(),
        },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      status: 'SUCCESS',
      message: '수량을 변경했습니다.',
      data: { cartItemId, quantity: body.quantity },
      error: null,
      timestamp: nowIso(),
    });
  }),

  // DELETE /api/v1/carts/items — 상품 삭제(단일·다건 공통)
  http.delete(`${BASE}/api/v1/carts/items`, async ({ request }) => {
    const body = (await request.json()) as { cartItemIds?: number[] };
    const ids = new Set(body.cartItemIds ?? []);

    if (ids.size === 0) {
      return HttpResponse.json(
        {
          status: 'ERROR',
          message: '삭제할 상품을 확인할 수 없습니다.',
          data: null,
          error: 'INVALID_CART_ITEM_IDS',
          timestamp: nowIso(),
        },
        { status: 400 },
      );
    }

    mockCart = mockCart
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => !ids.has(item.cartItemId)),
      }))
      .filter((group) => group.items.length > 0);

    return HttpResponse.json({
      status: 'SUCCESS',
      message: '상품을 삭제했습니다.',
      data: { removedCartItemIds: [...ids] },
      error: null,
      timestamp: nowIso(),
    });
  }),
];
