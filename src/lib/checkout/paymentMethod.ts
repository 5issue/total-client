import type { OtherPaymentMethodId, PaymentMethodId } from '@/components/organisms/checkout/model';
import type { SpringPaymentMethod } from '@/types/checkout';

/**
 * 컬리 자체 결제(충전금·컬리페이). 토스 PG 범위가 아니다(#109).
 * 아코디언 UI 는 퍼블(#82) 그대로 두고, 결제하기에서만 막는다.
 */
export function isKurlyOwnedPaymentMethod(
  method: PaymentMethodId | null,
): method is 'charge' | 'kurlypay' {
  return method === 'charge' || method === 'kurlypay';
}

/** 토스 결제창으로 진행하는 1차 선택. 네이버페이는 아코디언에서 이미 disabled. */
export function isTossPgMethod(method: PaymentMethodId | null): boolean {
  return method === 'other';
}

const OTHER_METHOD_TO_SPRING: Record<OtherPaymentMethodId, SpringPaymentMethod> = {
  card: 'CARD',
  phone: 'PHONE',
  tosspay: 'TOSSPAY',
  kakaopay: 'KAKAOPAY',
  payco: 'PAYCO',
};

export function toSpringPaymentMethod(method: OtherPaymentMethodId): SpringPaymentMethod {
  return OTHER_METHOD_TO_SPRING[method];
}

const SPRING_PAYMENT_METHODS = new Set<string>(['CARD', 'PHONE', 'TOSSPAY', 'KAKAOPAY', 'PAYCO']);

/** 토스 결제창형에서 고른 수단 코드 → Spring `paymentMethod`. */
export function toSpringPaymentMethodFromTossCode(code: string): SpringPaymentMethod {
  if (code === 'MOBILE_PHONE') return 'PHONE';
  if (SPRING_PAYMENT_METHODS.has(code)) return code as SpringPaymentMethod;
  return 'CARD';
}

/**
 * Toss `orderId` — 영문/숫자/`-_`, 64자 이내. 실제 주문(#126)은 서버 `orderNo` 를 그대로 쓰고,
 * 이 함수는 `orderId`/`orderNo` prop 이 없는 경로(직접 진입·스토리북 목데이터)에서만 쓰인다.
 */
export function createTossOrderId() {
  return `ord_${crypto.randomUUID().replace(/-/g, '')}`;
}

export function createIdempotencyKey() {
  return crypto.randomUUID();
}
