import { HttpResponse, http } from 'msw';

/**
 * Spring 배송지 API 목킹. 경로·필드는 `src/types/address.ts` 계약
 * (`GET/POST /api/v1/users/me/addresses`)과 맞춘다.
 * Route Handler 가 서버사이드로 호출하는 요청만 가로챈다(api-convention §3).
 */
const BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';
const ADDRESSES_PATH = `${BASE}/api/v1/users/me/addresses`;

function nowIso() {
  return new Date().toISOString();
}

interface MockAddress {
  addressId: number;
  addressName: string;
  recipientName: string;
  phone: string;
  zipCode: string;
  address: string;
  addressDetail: string | null;
  isDefault: boolean;
  accessMethod: string | null;
}

let nextId = 3002;
let mockAddresses: MockAddress[] = [
  {
    addressId: 3001,
    addressName: '우리집',
    recipientName: '이준호',
    phone: '01012341234',
    zipCode: '06236',
    address: '서울특별시 강남구 테헤란로 152',
    addressDetail: '101동 1502호',
    isDefault: true,
    accessMethod: null,
  },
];

export const addressHandlers = [
  http.get(ADDRESSES_PATH, () => {
    return HttpResponse.json({
      status: 'SUCCESS',
      message: '배송지 목록을 조회했습니다.',
      data: { addresses: mockAddresses },
      error: null,
      timestamp: nowIso(),
    });
  }),

  http.post(ADDRESSES_PATH, async ({ request }) => {
    const body = (await request.json()) as Omit<MockAddress, 'addressId'>;

    if (body.isDefault) {
      mockAddresses = mockAddresses.map((a) => ({ ...a, isDefault: false }));
    }

    const addressId = nextId++;
    mockAddresses = [
      ...mockAddresses,
      {
        addressId,
        addressName: body.addressName,
        recipientName: body.recipientName,
        phone: body.phone,
        zipCode: body.zipCode,
        address: body.address,
        addressDetail: body.addressDetail ?? null,
        isDefault: body.isDefault,
        accessMethod: body.accessMethod ?? null,
      },
    ];

    return HttpResponse.json(
      {
        status: 'SUCCESS',
        message: '배송지를 추가했습니다.',
        data: { addressId, success: true },
        error: null,
        timestamp: nowIso(),
      },
      { status: 201 },
    );
  }),
];
