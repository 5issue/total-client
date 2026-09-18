import type { ZodType } from 'zod';

import { ApiError } from '@/errors/ApiError';
import type { ApiEnvelope } from '@/lib/apiResponse';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/authTokenRef';
import {
  AddressListResponseSchema,
  AddressSchema,
  DeleteAddressResponseSchema,
  type SaveAddressRequest,
} from '@/types/address';
import { SpringLoginUrlDataSchema, type OAuthProvider } from '@/types/auth';
import {
  CartResponseSchema,
  RemoveCartItemsResponseSchema,
  UpdateCartItemQuantityResponseSchema,
  type RemoveCartItemsRequest,
  type UpdateCartItemQuantityRequest,
} from '@/types/cart';
import {
  CheckoutPaymentRequestSchema,
  CheckoutPaymentResponseSchema,
  ConfirmPaymentRequestSchema,
  PaymentReceiptSchema,
  type ConfirmPaymentRequest,
} from '@/types/checkout';
import {
  CancellationReturnHistoryResponseSchema,
  OrderCancelRequestSchema,
  OrderCancelResponseSchema,
  OrderDetailResponseSchema,
  OrderListResponseSchema,
  OrderReturnRequestSchema,
  OrderReturnResponseSchema,
  ReturnPreviewResponseSchema,
  type CancellationReturnParams,
  type OrderCancelRequest,
  type OrderListParams,
  type OrderReturnRequest,
} from '@/types/order';
import { ProductListResponseSchema, type ProductListParams } from '@/types/product';

/**
 * HTTP 클라이언트 — publicFetch / privateFetch (api-convention §3).
 *
 * 두 래퍼 모두 "우리 자신의" `/api/**` Route Handler 만 호출한다. Spring 백엔드는 절대
 * 브라우저에서 직접 부르지 않는다 — Route Handler 가 서버에서 대신 호출한다(각 route.ts 안 로직).
 * 응답은 항상 우리 공용 봉투 `{ statusCode, message, data }`(apiResponse.ts, §6) 이므로
 * 여기서 data 만 꺼내(`unwrap`) 도메인 Zod 스키마로 검증한 뒤 반환한다.
 *
 * ⚠️ 현재 구현은 브라우저(클라이언트 컴포넌트) 호출을 기준으로 한다. 서버(RSC)에서 우리 자신의
 * `/api/**` 를 절대경로 없이 self-fetch 하려면 별도의 서버 전용 base URL 처리가 필요하다 —
 * 이 도메인(auth)은 아직 그 경로를 안 타므로 이번 구현 범위에서는 다루지 않는다.
 */

function baseHeaders(init?: RequestInit): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...init?.headers,
  };
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  return envelope.data;
}

/** 인증 불필요 — 우리 `/api/**` 호출. */
export async function publicFetch<T>(
  path: string,
  schema: ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, { ...init, headers: baseHeaders(init) });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok) throw ApiError.fromResponse(res.status, json);
  return schema.parse(unwrap(json));
}

/**
 * 인증 필요 — 우리 `/api/**` 호출 + Authorization 헤더 자동 첨부(메모리 보관 Access Token,
 * `useAuthTokenStore`/`authTokenRef.ts`, FE-05). 401 이면 `/api/auth/refresh` 를 1회 시도 →
 * 성공 시 원 요청 재시도, 실패 시 세션 정리 후 로그인 유도.
 */
export async function privateFetch<T>(
  path: string,
  schema: ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const doFetch = () => {
    const token = getAccessToken();
    return fetch(path, {
      ...init,
      headers: {
        ...baseHeaders(init),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  };

  let res = await doFetch();

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (!refreshed) {
      clearAccessToken();
      throw new ApiError(401, '로그인이 만료되었습니다. 다시 로그인해주세요.');
    }
    res = await doFetch();
  }

  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok) throw ApiError.fromResponse(res.status, json);
  return schema.parse(unwrap(json));
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/refresh', { method: 'POST' });
    if (!res.ok) return false;
    const json = (await res.json()) as ApiEnvelope<{ accessToken: string }>;
    setAccessToken(json.data.accessToken);
    return true;
  } catch {
    return false;
  }
}

// --- 엔드포인트 함수 (api-convention §1·§8 — 훅은 이 함수를 호출, publicFetch 직접 호출 금지) ---

/** 소셜 로그인 URL 발급 (카카오/네이버). 로그인 전 단계라 인증 불필요. */
export function requestSocialLoginUrl(provider: OAuthProvider) {
  return publicFetch(`/api/auth/oauth/${provider}`, SpringLoginUrlDataSchema, { method: 'POST' });
}

/** 검색 결과 상품 목록 조회. 로그인 여부와 무관하게 노출되는 공개 데이터. */
export function searchProducts(params: ProductListParams) {
  const query = new URLSearchParams({ query: params.query, sort: params.sort });
  return publicFetch(`/api/products?${query}`, ProductListResponseSchema);
}

/** 장바구니 조회(배송 그룹별). */
export function getCart() {
  return privateFetch('/api/cart', CartResponseSchema);
}

/** 장바구니 상품 수량 변경 — api-convention §7 유일한 Optimistic Update 예외 대상. */
export function updateCartItemQuantity(cartItemId: number, body: UpdateCartItemQuantityRequest) {
  return privateFetch(`/api/cart/items/${cartItemId}`, UpdateCartItemQuantityResponseSchema, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/** 장바구니 상품 삭제(단일·다건 공통). */
export function removeCartItems(body: RemoveCartItemsRequest) {
  return privateFetch('/api/cart/items', RemoveCartItemsResponseSchema, {
    method: 'DELETE',
    body: JSON.stringify(body),
  });
}

/** 배송지 목록 조회. */
export function getAddresses() {
  return privateFetch('/api/addresses', AddressListResponseSchema);
}

/** 배송지 추가. */
export function createAddress(body: SaveAddressRequest) {
  return privateFetch('/api/addresses', AddressSchema, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** 배송지 수정. */
export function updateAddress(addressId: number, body: SaveAddressRequest) {
  return privateFetch(`/api/addresses/${addressId}`, AddressSchema, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/** 배송지 삭제. */
export function deleteAddress(addressId: number) {
  return privateFetch(`/api/addresses/${addressId}`, DeleteAddressResponseSchema, {
    method: 'DELETE',
  });
}

/** Toss successUrl 착지 후 결제 승인. Spring `POST /api/v1/payments/checkout`. */
export function confirmPayment(body: ConfirmPaymentRequest) {
  const parsed = ConfirmPaymentRequestSchema.parse(body);
  const { idempotencyKey, ...checkoutBody } = parsed;
  return privateFetch('/api/payments/checkout', CheckoutPaymentResponseSchema, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(CheckoutPaymentRequestSchema.parse(checkoutBody)),
  });
}

/** 영수증 조회. `GET /api/v1/payments/{payment_id}/receipt`. */
export function getPaymentReceipt(paymentId: number) {
  return privateFetch(
    `/api/payments/${encodeURIComponent(String(paymentId))}/receipt`,
    PaymentReceiptSchema,
  );
}

/** 내 주문 목록(주문 이력) 조회. `range` 는 Spring 이 대문자(3M/6M/1Y/3Y)만 받는다. */
export function getOrders(params: OrderListParams) {
  const query = new URLSearchParams();
  if (params.range) query.set('range', params.range);
  if (params.productName) query.set('productName', params.productName);
  if (params.page) query.set('page', String(params.page));
  if (params.size) query.set('size', String(params.size));
  const qs = query.toString();
  return privateFetch(`/api/orders${qs ? `?${qs}` : ''}`, OrderListResponseSchema);
}

/** 주문 상세(주문 추적) 조회 — 배송·결제 스냅샷 + 자체 취소 가능 여부(`selfCancelable`) 포함. */
export function getOrderDetail(orderId: number) {
  return privateFetch(`/api/orders/${orderId}`, OrderDetailResponseSchema);
}

/** 주문 취소(배송 전) 신청. */
export function cancelOrder(orderId: number, body: OrderCancelRequest) {
  return privateFetch(`/api/orders/${orderId}/cancel`, OrderCancelResponseSchema, {
    method: 'POST',
    body: JSON.stringify(OrderCancelRequestSchema.parse(body)),
  });
}

/** 취소·반품 통합 내역 조회. */
export function getCancellationsReturns(params: CancellationReturnParams) {
  const query = new URLSearchParams();
  if (params.requestType) query.set('requestType', params.requestType);
  if (params.requestStatus) query.set('requestStatus', params.requestStatus);
  if (params.page) query.set('page', String(params.page));
  if (params.size) query.set('size', String(params.size));
  const qs = query.toString();
  return privateFetch(
    `/api/orders/cancellations-returns${qs ? `?${qs}` : ''}`,
    CancellationReturnHistoryResponseSchema,
  );
}

/** 반품 접수 사전조회 — 반품 접수 화면 진입 시 사유 옵션·예상 환불액을 먼저 받는다. */
export function getReturnPreview(orderId: number) {
  return privateFetch(`/api/orders/${orderId}/returns/preview`, ReturnPreviewResponseSchema);
}

/** 전체 주문 반품(환불) 신청(배송 완료 후). */
export function submitOrderReturn(orderId: number, body: OrderReturnRequest) {
  return privateFetch(`/api/orders/${orderId}/returns`, OrderReturnResponseSchema, {
    method: 'POST',
    body: JSON.stringify(OrderReturnRequestSchema.parse(body)),
  });
}
/**
 * 앱 부팅 시 무음 재발급 — `refresh_token` 쿠키가 있으면 accessToken 을 메모리에 채운다.
 * 게스트(쿠키 없음)는 조용히 `authenticated: false` 로 처리한다(에러 아님).
 * `privateFetch` 의 401 lazy refresh 와 별개로, 첫 인증 요청 전에 세션을 미리 세운다.
 */
export async function bootstrapSession(): Promise<{ authenticated: boolean }> {
  const ok = await tryRefresh();
  if (!ok) {
    clearAccessToken();
    return { authenticated: false };
  }
  return { authenticated: true };
}
