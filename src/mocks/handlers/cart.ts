import { HttpResponse, http } from 'msw';

/**
 * Spring 장바구니 API 목킹. 경로·응답은 `src/types/cart.ts` 계약과 맞춘다.
 * Route Handler 가 서버사이드로 호출하는 요청만 가로챈다(api-convention §3).
 */
const BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

function nowIso() {
  return new Date().toISOString();
}

interface MockCartItem {
  cartItemId: number;
  productId: number;
  skuId: number | null;
  title: string;
  thumbnailUrl: string | null;
  unitPrice: number;
  quantity: number;
  maxQuantity: number;
  available: boolean;
}

interface MockCartGroup {
  deliveryType: 'DAWN' | 'PARCEL' | 'SELLER' | null;
  temperatureType: 'ROOM_TEMPERATURE' | 'REFRIGERATED' | 'FROZEN';
  seller: { sellerId: number; sellerName: string } | null;
  items: MockCartItem[];
  groupDeliveryFee: number;
}

const MOCK_SELECTED_ADDRESS = {
  addressId: 3001,
  addressName: '우리집',
  recipientName: '이준호',
  recipientPhone: '01012341234',
  zipCode: '06236',
  address: '서울특별시 강남구 테헤란로 152',
  detailAddress: '101동 1502호',
};

let nextCartItemId = 2005;
let mockSelectedAddress: typeof MOCK_SELECTED_ADDRESS | null = MOCK_SELECTED_ADDRESS;
let mockCart: MockCartGroup[] = [
  {
    deliveryType: 'DAWN',
    temperatureType: 'REFRIGERATED',
    seller: null,
    groupDeliveryFee: 0,
    items: [
      {
        cartItemId: 2001,
        productId: 10,
        skuId: 1001,
        title: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
        thumbnailUrl: 'https://cdn.example.com/products/10.jpg',
        unitPrice: 2780,
        quantity: 1,
        maxQuantity: 10,
        available: true,
      },
      {
        cartItemId: 2002,
        productId: 11,
        skuId: 1002,
        title: "[Kurly's] 동물복지 유정란 20구",
        thumbnailUrl: 'https://cdn.example.com/products/11.jpg',
        unitPrice: 10051,
        quantity: 1,
        maxQuantity: 10,
        available: true,
      },
      {
        cartItemId: 2003,
        productId: 12,
        skuId: 1003,
        title: '바로먹는 아보카도 3입 (페루산)',
        thumbnailUrl: 'https://cdn.example.com/products/12.jpg',
        unitPrice: 9990,
        quantity: 1,
        maxQuantity: 10,
        available: true,
      },
      {
        cartItemId: 2004,
        productId: 13,
        skuId: 1004,
        title: '[풀무원] 동물복지 치킨 너겟 오리지널',
        thumbnailUrl: 'https://cdn.example.com/products/13.jpg',
        unitPrice: 7979,
        quantity: 1,
        maxQuantity: 10,
        available: true,
      },
    ],
  },
];

function toCartResponse() {
  const groups = mockCart.map((group) => ({
    deliveryType: group.deliveryType,
    temperatureType: group.temperatureType,
    seller: group.seller,
    items: group.items,
    groupItemAmount: group.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    groupDeliveryFee: group.groupDeliveryFee,
  }));
  const totalItemAmount = groups.reduce((sum, group) => sum + group.groupItemAmount, 0);
  const deliveryFee = groups.reduce((sum, group) => sum + group.groupDeliveryFee, 0);
  return {
    selectedAddress: mockSelectedAddress,
    groups,
    amountSummary: {
      totalItemAmount,
      discountAmount: 0,
      deliveryFee,
      paymentAmount: totalItemAmount + deliveryFee,
    },
  };
}

function findItemByProductId(productId: number) {
  for (const group of mockCart) {
    const item = group.items.find((candidate) => candidate.productId === productId);
    if (item) return item;
  }
  return undefined;
}

export const cartHandlers = [
  http.get(`${BASE}/api/v1/carts`, () => {
    return HttpResponse.json({
      status: 'SUCCESS',
      message: '장바구니를 조회했습니다.',
      data: toCartResponse(),
      error: null,
      timestamp: nowIso(),
    });
  }),

  http.post(`${BASE}/api/v1/carts/items`, async ({ request }) => {
    const body = (await request.json()) as {
      items?: { productId: number; quantity: number }[];
    };
    const items = body.items ?? [];
    if (items.length === 0) {
      return HttpResponse.json(
        {
          status: 'ERROR',
          message: '담을 상품을 확인할 수 없습니다.',
          data: null,
          error: 'INVALID_CART_ITEMS',
          timestamp: nowIso(),
        },
        { status: 400 },
      );
    }

    for (const incoming of items) {
      const existing = findItemByProductId(incoming.productId);
      if (existing) {
        existing.quantity += incoming.quantity;
        continue;
      }
      mockCart[0]?.items.push({
        cartItemId: nextCartItemId++,
        productId: incoming.productId,
        skuId: null,
        title: `상품 ${incoming.productId}`,
        thumbnailUrl: null,
        unitPrice: 10000,
        quantity: incoming.quantity,
        maxQuantity: 10,
        available: true,
      });
    }

    return HttpResponse.json(
      {
        status: 'SUCCESS',
        message: '상품을 담았습니다.',
        data: toCartResponse(),
        error: null,
        timestamp: nowIso(),
      },
      { status: 201 },
    );
  }),

  http.patch(`${BASE}/api/v1/carts/items/:productId`, async ({ params, request }) => {
    const productId = Number(params.productId);
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

    const item = findItemByProductId(productId);
    if (!item) {
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

    item.quantity = body.quantity;
    return HttpResponse.json({
      status: 'SUCCESS',
      message: '수량을 변경했습니다.',
      data: null,
      error: null,
      timestamp: nowIso(),
    });
  }),

  http.delete(`${BASE}/api/v1/carts/items`, async ({ request }) => {
    const body = (await request.json()) as { productIds?: number[] };
    const ids = new Set(body.productIds ?? []);

    if (ids.size === 0) {
      return HttpResponse.json(
        {
          status: 'ERROR',
          message: '삭제할 상품을 확인할 수 없습니다.',
          data: null,
          error: 'INVALID_PRODUCT_IDS',
          timestamp: nowIso(),
        },
        { status: 400 },
      );
    }

    mockCart = mockCart
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => !ids.has(item.productId)),
      }))
      .filter((group) => group.items.length > 0);

    return HttpResponse.json({
      status: 'SUCCESS',
      message: '상품을 삭제했습니다.',
      data: { deletedProductIds: [...ids] },
      error: null,
      timestamp: nowIso(),
    });
  }),

  http.put(`${BASE}/api/v1/carts/delivery-address`, async ({ request }) => {
    const body = (await request.json()) as { addressId?: number };
    if (!body.addressId || !Number.isInteger(body.addressId) || body.addressId <= 0) {
      return HttpResponse.json(
        {
          status: 'ERROR',
          message: '배송지를 확인할 수 없습니다.',
          data: null,
          error: 'INVALID_ADDRESS_ID',
          timestamp: nowIso(),
        },
        { status: 400 },
      );
    }

    mockSelectedAddress = {
      ...MOCK_SELECTED_ADDRESS,
      addressId: body.addressId,
    };

    return HttpResponse.json({
      status: 'SUCCESS',
      message: '배송지를 변경했습니다.',
      data: {
        selectedAddress: mockSelectedAddress,
        deliverable: true,
        deliveryType: 'DAWN',
        cutoffAt: nowIso(),
        expectedDeliveryAt: nowIso(),
      },
      error: null,
      timestamp: nowIso(),
    });
  }),
];
