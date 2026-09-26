import { HttpResponse, http } from 'msw';

/**
 * Spring 결제 승인·영수증 목킹. 경로는 BE 명세와 동일.
 * Route Handler 가 서버사이드로 호출하는 요청만 가로챈다(api-convention §3).
 */
const BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

function nowIso() {
  return new Date().toISOString();
}

const MOCK_PAYMENT_ID = 12345;
const MOCK_ORDER_ID = 111;
const MOCK_AMOUNT = 30800;
const MOCK_RECEIPT_URL = 'https://toss.im/receipt/url-dummy';

export const checkoutHandlers = [
  http.post(`${BASE}/api/v1/payments/checkout`, async ({ request }) => {
    const idempotencyKey =
      request.headers.get('Idempotency-Key') ?? request.headers.get('Idemopotency-Key');
    const body = (await request.json()) as {
      paymentMethod?: string;
      paymentKey?: string;
      amount?: number;
    };

    if (!idempotencyKey) {
      return HttpResponse.json(
        {
          status: 'ERROR',
          message: '요청이 올바르지 않습니다.',
          data: null,
          error: 'BAD_REQUEST',
          timestamp: nowIso(),
        },
        { status: 400 },
      );
    }

    if (!body.paymentMethod || !body.paymentKey || !body.amount) {
      return HttpResponse.json(
        {
          status: 'ERROR',
          message: '결제 정보가 올바르지 않습니다.',
          data: null,
          error: 'BAD_REQUEST',
          timestamp: nowIso(),
        },
        { status: 400 },
      );
    }

    if (body.amount !== MOCK_AMOUNT) {
      return HttpResponse.json(
        {
          status: 'ERROR',
          message: '요청된 결제 금액이 실제 주문 금액과 일치하지 않습니다.',
          data: null,
          error: 'BAD_REQUEST',
          timestamp: nowIso(),
        },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      status: 'SUCCESS',
      message: '결제가 성공적으로 승인 및 완료되었습니다.',
      data: {
        paymentCompletedAt: nowIso(),
        receiptUrl: MOCK_RECEIPT_URL,
        paymentStatus: 'SUCCESS',
        paymentId: MOCK_PAYMENT_ID,
      },
      error: null,
      timestamp: nowIso(),
    });
  }),

  http.get(`${BASE}/api/v1/payments/:paymentId/receipt`, ({ params }) => {
    const paymentId = Number(params.paymentId);
    if (!Number.isInteger(paymentId) || paymentId <= 0) {
      return HttpResponse.json(
        {
          status: 'ERROR',
          message: '존재하지 않는 결제 내역입니다.',
          data: null,
          error: 'NOT_FOUND',
          timestamp: nowIso(),
        },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      status: 'SUCCESS',
      message: '주문 완료 및 결제 영수증 정보가 조회되었습니다.',
      data: {
        paymentId,
        orderId: MOCK_ORDER_ID,
        paymentMethod: 'CARD',
        totalAmount: MOCK_AMOUNT,
        paymentCompletedAt: nowIso(),
        receiptUrl: MOCK_RECEIPT_URL,
      },
      error: null,
      timestamp: nowIso(),
    });
  }),
];
