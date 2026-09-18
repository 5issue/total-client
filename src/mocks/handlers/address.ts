import { HttpResponse, http } from 'msw';

/**
 * Spring 배송지 API 목킹. 경로·응답 형태는 이슈 #119 명세 그대로.
 * Route Handler 가 서버사이드로 호출하는 요청만 가로챈다(api-convention §3).
 * cart 도메인 mock 과 같은 이유로 모듈 레벨 mutable 배열에 상태를 유지한다.
 */
const BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

function nowIso() {
  return new Date().toISOString();
}

interface MockAddress {
  addressId: number;
  aliasType: 'HOME' | 'COMPANY' | null;
  customAlias: string | null;
  zonecode: string;
  roadAddress: string;
  detailAddress: string | null;
  recipient: string;
  phone: string;
  deliveryType: string;
  isDefault: boolean;
}

let nextId = 3002;
let mockAddresses: MockAddress[] = [
  {
    addressId: 3001,
    aliasType: 'HOME',
    customAlias: null,
    zonecode: '06236',
    roadAddress: '서울특별시 강남구 테헤란로 152',
    detailAddress: '101동 1502호',
    recipient: '이준호',
    phone: '01012341234',
    deliveryType: '샛별배송',
    isDefault: true,
  },
];

export const addressHandlers = [
  // GET /api/v1/addresses — 배송지 목록 조회
  http.get(`${BASE}/api/v1/addresses`, () => {
    return HttpResponse.json({
      status: 'SUCCESS',
      message: '배송지 목록을 조회했습니다.',
      data: { addresses: mockAddresses },
      error: null,
      timestamp: nowIso(),
    });
  }),

  // POST /api/v1/addresses — 배송지 추가
  http.post(`${BASE}/api/v1/addresses`, async ({ request }) => {
    const body = (await request.json()) as Omit<MockAddress, 'addressId' | 'deliveryType'>;

    if (body.isDefault) {
      mockAddresses = mockAddresses.map((a) => ({ ...a, isDefault: false }));
    }

    const created: MockAddress = {
      ...body,
      addressId: nextId++,
      deliveryType: '샛별배송',
    };
    mockAddresses = [...mockAddresses, created];

    return HttpResponse.json(
      {
        status: 'SUCCESS',
        message: '배송지를 추가했습니다.',
        data: created,
        error: null,
        timestamp: nowIso(),
      },
      { status: 201 },
    );
  }),

  // PUT /api/v1/addresses/{addressId} — 배송지 수정
  http.put(`${BASE}/api/v1/addresses/:addressId`, async ({ params, request }) => {
    const addressId = Number(params.addressId);
    const body = (await request.json()) as Omit<MockAddress, 'addressId' | 'deliveryType'>;

    const target = mockAddresses.find((a) => a.addressId === addressId);
    if (!target) {
      return HttpResponse.json(
        {
          status: 'ERROR',
          message: '배송지를 찾을 수 없습니다.',
          data: null,
          error: 'ADDRESS_NOT_FOUND',
          timestamp: nowIso(),
        },
        { status: 404 },
      );
    }

    if (body.isDefault) {
      mockAddresses = mockAddresses.map((a) =>
        a.addressId === addressId ? a : { ...a, isDefault: false },
      );
    }

    const updated: MockAddress = { ...target, ...body, addressId };
    mockAddresses = mockAddresses.map((a) => (a.addressId === addressId ? updated : a));

    return HttpResponse.json({
      status: 'SUCCESS',
      message: '배송지를 수정했습니다.',
      data: updated,
      error: null,
      timestamp: nowIso(),
    });
  }),

  // DELETE /api/v1/addresses/{addressId} — 배송지 삭제
  http.delete(`${BASE}/api/v1/addresses/:addressId`, ({ params }) => {
    const addressId = Number(params.addressId);
    const exists = mockAddresses.some((a) => a.addressId === addressId);

    if (!exists) {
      return HttpResponse.json(
        {
          status: 'ERROR',
          message: '배송지를 찾을 수 없습니다.',
          data: null,
          error: 'ADDRESS_NOT_FOUND',
          timestamp: nowIso(),
        },
        { status: 404 },
      );
    }

    mockAddresses = mockAddresses.filter((a) => a.addressId !== addressId);

    return HttpResponse.json({
      status: 'SUCCESS',
      message: '배송지를 삭제했습니다.',
      data: { addressId },
      error: null,
      timestamp: nowIso(),
    });
  }),
];
