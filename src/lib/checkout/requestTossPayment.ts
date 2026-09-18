import { ANONYMOUS, loadTossPayments } from '@tosspayments/tosspayments-sdk';
import type { TossPaymentsSDK } from '@tosspayments/tosspayments-sdk';

import type { OtherPaymentMethodId } from '@/components/organisms/checkout/model';
import {
  toSpringPaymentMethod,
  toSpringPaymentMethodFromTossCode,
} from '@/lib/checkout/paymentMethod';

/**
 * 토스 결제창 `cardCompany` 코드.
 * https://docs.tosspayments.com/codes/orgs
 */
const CARD_ISSUER_TO_TOSS: Record<string, string> = {
  hyundai: 'HYUNDAI',
  shinhan: 'SHINHAN',
  bc: 'BC',
  kb: 'KOOKMIN',
  samsung: 'SAMSUNG',
  lotte: 'LOTTE',
  hana: 'HANA',
  nh: 'NH',
  woori: 'WOORI',
  suhyup: 'SUHYEOP',
  citi: 'CITI',
  gwangju: 'KWANGJU',
  jeonbuk: 'JEONBUK',
  jeju: 'JEJU',
  'shinhyup-check': 'SHINHYEOP',
  'mg-check': 'SAEMAUL',
  'savings-check': 'SAVINGSBANK',
  'post-card': 'POST',
  kdb: 'KDBBANK',
  kakaobank: 'KAKAOBANK',
};

const EASY_PAY: Record<Extract<OtherPaymentMethodId, 'tosspay' | 'kakaopay' | 'payco'>, string> = {
  tosspay: 'TOSSPAY',
  kakaopay: 'KAKAOPAY',
  payco: 'PAYCO',
};

export type RequestTossCheckoutPaymentInput = {
  clientKey: string;
  amount: number;
  orderId: string;
  orderName: string;
  method: OtherPaymentMethodId;
  cardIssuer: string | null;
  customerName?: string;
  customerEmail?: string;
};

function isWidgetClientKey(clientKey: string) {
  return clientKey.includes('_gck_') || clientKey.includes('_gsk_');
}

function redirectUrls(paymentMethod: string) {
  const origin = window.location.origin;
  const successUrl = new URL('/checkout/success', origin);
  successUrl.searchParams.set('paymentMethod', paymentMethod);
  return { successUrl: successUrl.toString(), failUrl: `${origin}/checkout/fail` };
}

/**
 * 퍼블 '다른 결제수단' 그리드는 주문서에 두고, 결제하기에서 토스 결제창만 연다.
 *
 * - API 개별 연동 키(`test_ck_`) → `payment().requestPayment` — 우리가 고른
 *   `method`(토스페이/카카오페이/PAYCO/카드/휴대폰)를 그대로 존중해 해당 PG로 다이렉트
 *   이동한다(`flowMode: 'DIRECT'`). **이 앱이 실제로 써야 하는 경로.**
 * - 주문서형/결제창형 키(`test_gck_`) → `widgets().renderPaymentWindow`. 이 위젯은
 *   `input.method` 를 무시하고 **토스 자신의 결제수단 선택 UI를 다시 그린다** — 우리
 *   그리드와 똑같이 생긴 화면이 한 번 더 뜨는 것처럼 보인다(버그 리포트: 토스페이를
 *   눌렀는데 방금 본 그리드가 또 나옴). 이 앱은 자체 그리드로 이미 선택을 받으므로
 *   위젯 키를 쓰면 안 된다 — `.env.example` 참고.
 *
 * `payment()` 에 위젯 키를 넣으면 "API 개별 연동 키로 연동해주세요" 가 난다.
 */
export async function requestTossCheckoutPayment(input: RequestTossCheckoutPaymentInput) {
  const tossPayments = await loadTossPayments(input.clientKey);
  if (isWidgetClientKey(input.clientKey)) {
    await requestWidgetPaymentWindow(tossPayments, input);
    return;
  }
  await requestLegacyPayment(tossPayments, input);
}

async function requestWidgetPaymentWindow(
  tossPayments: TossPaymentsSDK,
  input: RequestTossCheckoutPaymentInput,
) {
  const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });
  await widgets.setAmount({ currency: 'KRW', value: input.amount });
  const paymentWindow = await widgets.renderPaymentWindow();

  await new Promise<void>((resolve, reject) => {
    paymentWindow.on('cancel', async () => {
      reject(Object.assign(new Error('결제가 취소되었습니다.'), { code: 'USER_CANCEL' }));
    });

    paymentWindow.on('paymentRequest', async ({ paymentMethod }) => {
      const urls = redirectUrls(toSpringPaymentMethodFromTossCode(paymentMethod.code));
      try {
        await widgets.requestPayment({
          orderId: input.orderId,
          orderName: input.orderName,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          successUrl: urls.successUrl,
          failUrl: urls.failUrl,
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function requestLegacyPayment(
  tossPayments: TossPaymentsSDK,
  input: RequestTossCheckoutPaymentInput,
) {
  const payment = tossPayments.payment({ customerKey: ANONYMOUS });
  const urls = redirectUrls(toSpringPaymentMethod(input.method));
  const common = {
    amount: { currency: 'KRW' as const, value: input.amount },
    orderId: input.orderId,
    orderName: input.orderName,
    successUrl: urls.successUrl,
    failUrl: urls.failUrl,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
  };

  if (input.method === 'phone') {
    await payment.requestPayment({ ...common, method: 'MOBILE_PHONE' });
    return;
  }

  if (input.method === 'tosspay' || input.method === 'kakaopay' || input.method === 'payco') {
    await payment.requestPayment({
      ...common,
      method: 'CARD',
      card: {
        useEscrow: false,
        flowMode: 'DIRECT',
        easyPay: EASY_PAY[input.method],
        useCardPoint: false,
        useAppCardOnly: false,
      },
    });
    return;
  }

  const cardCompany = input.cardIssuer ? CARD_ISSUER_TO_TOSS[input.cardIssuer] : undefined;
  await payment.requestPayment({
    ...common,
    method: 'CARD',
    card: {
      useEscrow: false,
      flowMode: cardCompany ? 'DIRECT' : 'DEFAULT',
      ...(cardCompany ? { cardCompany } : {}),
      useCardPoint: false,
      useAppCardOnly: false,
    },
  });
}
