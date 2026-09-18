import { HttpResponse, http } from 'msw';

/**
 * Spring 주문/반품 API 목킹. 경로·응답 형태는 BE 명세(이슈 #115) 그대로.
 * Route Handler 가 서버사이드로 호출하는 요청만 가로챈다(api-convention §3).
 */
const BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

function nowIso() {
  return new Date().toISOString();
}

const MOCK_ORDER_ID = 501;

export const orderHandlers = [
  // GET /api/v1/orders/{orderId}/returns/preview — 반품 접수 사전조회
  http.get(`${BASE}/api/v1/orders/:orderId/returns/preview`, ({ params }) => {
    const orderId = Number(params.orderId);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return HttpResponse.json(
        {
          status: 'ERROR',
          message: '주문 정보를 찾을 수 없습니다.',
          data: null,
          error: 'ORDER_NOT_FOUND',
          timestamp: nowIso(),
        },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      status: 'SUCCESS',
      message: '반품 접수 정보를 조회했습니다.',
      data: {
        orderId,
        returnable: true,
        temperaturePolicy: 'CHILLED',
        reasonOptions: [
          { code: 'RTN02', displayName: '상품 불량', attachmentRequired: true },
          { code: 'RTN03', displayName: '상품 파손', attachmentRequired: true },
          { code: 'RTN04', displayName: '냉해·해동', attachmentRequired: false },
          { code: 'RTN05', displayName: '오배송', attachmentRequired: false },
          { code: 'RTN06', displayName: '상품 누락', attachmentRequired: false },
          { code: 'RTN07', displayName: '상품 품절', attachmentRequired: false },
          { code: 'RTN08', displayName: '상품정보 상이', attachmentRequired: false },
        ],
        refundPreview: {
          paymentAmount: 32000,
          deductionAmount: 0,
          expectedRefundAmount: 32000,
        },
        returnPolicy: {
          collectionRequired: false,
          guideMessage: '상품 사진 확인 후 자체 폐기 또는 회수 여부가 결정됩니다.',
        },
      },
      error: null,
      timestamp: nowIso(),
    });
  }),

  // POST /api/v1/orders/{orderId}/returns — 전체 주문 반품 신청
  http.post(`${BASE}/api/v1/orders/:orderId/returns`, async ({ params, request }) => {
    const orderId = Number(params.orderId);
    const body = (await request.json()) as { reasonCode?: string; reasonDetail?: string };

    if (!body.reasonCode) {
      return HttpResponse.json(
        {
          status: 'ERROR',
          message: '올바르지 않은 반품 사유 코드입니다.',
          data: null,
          error: 'INVALID_RETURN_REASON_CODE',
          timestamp: nowIso(),
        },
        { status: 400 },
      );
    }

    return HttpResponse.json(
      {
        status: 'SUCCESS',
        message: '전체 주문 반품이 접수되었습니다.',
        data: {
          returnId: 72,
          orderId,
          returnStatus: 'REQUESTED',
          refundStatus: 'PENDING',
          expectedRefundAmount: 32000,
          requestedAt: nowIso(),
        },
        error: null,
        timestamp: nowIso(),
      },
      { status: 201 },
    );
  }),

  // GET /api/v1/orders — 내 주문 목록(주문 이력)
  http.get(`${BASE}/api/v1/orders`, () => {
    return HttpResponse.json({
      status: 'SUCCESS',
      message: '주문 목록 조회에 성공했습니다.',
      data: {
        total: 1,
        page: 1,
        size: 20,
        orders: [
          {
            orderId: MOCK_ORDER_ID,
            orderNo: 'O202608260001',
            orderedAt: nowIso(),
            orderStatus: 'PAID',
            fulfillmentStatus: 'PROCESSING',
            deliveryStatus: 'IN_TRANSIT',
            expectedDeliveryAt: nowIso(),
            deliveredAt: null,
            totalPrice: 41000,
            totalQuantity: 3,
            items: [
              {
                orderItemId: 1001,
                productId: 10,
                skuId: 1001,
                deliveryType: 'DAWN',
                title: '샐러드',
                thumbnailUrl: 'https://cdn.example.com/products/10.jpg',
                unitPrice: 16000,
                quantity: 2,
                totalPrice: 32000,
              },
            ],
          },
        ],
      },
      error: null,
      timestamp: nowIso(),
    });
  }),

  // GET /api/v1/orders/{orderId} — 주문 상세(주문 추적)
  http.get(`${BASE}/api/v1/orders/:orderId`, ({ params }) => {
    const orderId = Number(params.orderId);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return HttpResponse.json(
        {
          status: 'ERROR',
          message: '주문 정보를 찾을 수 없습니다.',
          data: null,
          error: 'ORDER_NOT_FOUND',
          timestamp: nowIso(),
        },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      status: 'SUCCESS',
      message: '주문 상세 조회에 성공했습니다.',
      data: {
        orderInfo: {
          orderId,
          orderNo: 'O202608260001',
          orderedAt: nowIso(),
          orderStatus: 'PAID',
          sender: { name: '홍길동', phoneNumber: '010-1234-5678' },
        },
        items: [
          {
            orderItemId: 1,
            productId: 10,
            skuId: 1001,
            thumbnailUrl: 'https://cdn.example.com/products/10.jpg',
            title: '샐러드',
            deliveryType: 'DAWN',
            unitPrice: 16000,
            quantity: 2,
            totalPrice: 32000,
          },
        ],
        deliveryInfo: {
          fulfillmentStatus: 'PROCESSING',
          deliveryStatus: 'IN_TRANSIT',
          expectedDeliveryAt: nowIso(),
          deliveredAt: null,
          receiver: { name: '김고객', phoneNumber: '010-9876-5432' },
          address: {
            postalCode: '06236',
            roadAddress: '서울시 강남구 ...',
            detailAddress: '101동 101호',
          },
          pickupType: 'DOOR',
          accessMethod: 'PASSWORD',
          packingType: 'PAPER',
          deliveryMessage: '문 앞에 놓아주세요',
        },
        paymentSummary: { paymentId: 9001, paymentAmount: 32000, paymentStatus: 'PAID' },
        selfCancelable: true,
      },
      error: null,
      timestamp: nowIso(),
    });
  }),

  // POST /api/v1/orders/{orderId}/cancel — 주문 취소(배송 전)
  http.post(`${BASE}/api/v1/orders/:orderId/cancel`, async ({ params, request }) => {
    const orderId = Number(params.orderId);
    const body = (await request.json()) as { reasonCode?: string };

    if (!body.reasonCode) {
      return HttpResponse.json(
        {
          status: 'ERROR',
          message: '올바르지 않은 취소 사유 코드입니다.',
          data: null,
          error: 'INVALID_CANCEL_REASON_CODE',
          timestamp: nowIso(),
        },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      status: 'SUCCESS',
      message: '전체 주문 취소가 접수되었습니다.',
      data: {
        cancellationId: 81,
        orderId,
        cancellationStatus: 'REQUESTED',
        refundAmount: 32000,
        cancelledAt: nowIso(),
      },
      error: null,
      timestamp: nowIso(),
    });
  }),

  // GET /api/v1/orders/cancellations-returns — 취소·반품 통합 내역
  http.get(`${BASE}/api/v1/orders/cancellations-returns`, () => {
    return HttpResponse.json({
      status: 'SUCCESS',
      message: '취소·반품 내역을 조회했습니다.',
      data: {
        total: 1,
        page: 1,
        size: 20,
        histories: [
          {
            requestType: 'CANCEL',
            requestId: 81,
            orderId: MOCK_ORDER_ID,
            orderNo: 'O202608260001',
            requestStatus: 'COMPLETED',
            refundStatus: 'COMPLETED',
            refundAmount: 41000,
            requestedAt: nowIso(),
            completedAt: nowIso(),
            items: [
              {
                orderItemId: 1001,
                productId: 10,
                skuId: 1001,
                deliveryType: 'DAWN',
                title: '샐러드',
                thumbnailUrl: 'https://cdn.example.com/products/10.jpg',
                unitPrice: 16000,
                quantity: 2,
                totalPrice: 32000,
              },
            ],
          },
        ],
      },
      error: null,
      timestamp: nowIso(),
    });
  }),
];
