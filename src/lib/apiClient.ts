import { ZodError, type ZodType } from 'zod';

import { ApiError } from '@/errors/ApiError';
import type { ApiEnvelope } from '@/lib/apiResponse';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/authTokenRef';
import {
  AddressListResponseSchema,
  AddressSchema,
  CreateAddressResponseSchema,
  DeleteAddressResponseSchema,
  type SaveAddressRequest,
} from '@/types/address';
import {
  SpringLoginUrlDataSchema,
  SpringLogoutDataSchema,
  SpringRefreshDataSchema,
  type OAuthProvider,
} from '@/types/auth';
import {
  CartResponseSchema,
  CartVoidResponseSchema,
  DeliveryAddressResponseSchema,
  RemoveCartItemsResponseSchema,
  type AddCartItemsRequest,
  type RemoveCartItemsRequest,
  type UpdateCartItemQuantityRequest,
} from '@/types/cart';
import {
  CheckoutPaymentResponseSchema,
  ConfirmPaymentRequestSchema,
  PaymentReceiptSchema,
  type ConfirmPaymentRequest,
} from '@/types/checkout';
import { FridgeDeleteResponseSchema, FridgeListResponseSchema } from '@/types/fridge';
import { HomeRecommendationsResponseSchema } from '@/types/home';
import {
  CancellationReturnHistoryResponseSchema,
  CheckoutOrderRequestSchema,
  CheckoutOrderResponseSchema,
  OrderCancelRequestSchema,
  OrderCancelResponseSchema,
  OrderDetailResponseSchema,
  OrderListResponseSchema,
  OrderReturnRequestSchema,
  OrderReturnResponseSchema,
  PlaceOrderRequestSchema,
  PlaceOrderResponseSchema,
  ReturnPreviewResponseSchema,
  type CancellationReturnParams,
  type CheckoutOrderRequest,
  type OrderCancelRequest,
  type OrderListParams,
  type OrderReturnRequest,
} from '@/types/order';
import {
  ProductAutocompleteResponseSchema,
  ProductCategoryListSchema,
  ProductDetailSchema,
  ProductFiltersSchema,
  ProductListResponseSchema,
  ProductsByAiResponseSchema,
  type ProductListParams,
} from '@/types/product';
import {
  FavoriteRecipeDeleteResponseSchema,
  FavoriteRecipeListResponseSchema,
  FavoriteRecipeSummarySchema,
  MissingProductsResponseSchema,
  MyRecipeRecommendationsResponseSchema,
  RecentRecipeDeleteRequestSchema,
  RecentRecipeDeleteResponseSchema,
  RecentRecipeListResponseSchema,
  RecentRecipeSummarySchema,
  RecipeDetailSchema,
  type FavoriteRecipeListParams,
  type MissingProductsParams,
  type MyRecipeRecommendationParams,
  type RecentRecipeListParams,
} from '@/types/recipe';
import { StorageGuideResponseSchema } from '@/types/storageGuide';
import { UserProfileResponseSchema } from '@/types/user';

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

/** 네트워크가 멈춰도 Query/Mutation 이 무한 대기하지 않도록 두 래퍼 공통으로 적용한다. */
const REQUEST_TIMEOUT_MS = 10_000;

function baseHeaders(init?: RequestInit): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...init?.headers,
  };
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  return envelope.data;
}

/** Zod 검증 실패를 사용자 친화적인 `ApiError` 로 정규화한다(api-convention §6). */
function parseOrThrow<T>(schema: ZodType<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (e) {
    if (e instanceof ZodError) {
      throw new ApiError(502, '요청 처리 중 오류가 발생했습니다.');
    }
    throw e;
  }
}

/**
 * `fetch` 자체가 던지는 예외(네트워크 끊김, `AbortSignal.timeout` 만료)를 두 래퍼 공통으로
 * `ApiError` 로 정규화한다 — 안 그러면 타임아웃·연결 실패가 `ApiError` 기반 오류 처리
 * 계약을 우회해 호출부(Query/Mutation)가 원본 예외를 그대로 받는다.
 */
async function fetchEnvelope<T>(path: string, init: RequestInit): Promise<ApiEnvelope<T>> {
  let res: Response;
  try {
    res = await fetch(path, init);
  } catch (e) {
    if (e instanceof DOMException && (e.name === 'TimeoutError' || e.name === 'AbortError')) {
      throw new ApiError(408, '요청 시간이 초과됐어요. 다시 시도해주세요.');
    }
    throw new ApiError(0, '네트워크 연결을 확인해주세요.');
  }
  let json: ApiEnvelope<T>;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError(res.ok ? 502 : res.status, '요청 처리 중 오류가 발생했습니다.');
  }
  if (!res.ok) throw ApiError.fromResponse(res.status, json);
  return json;
}

/** 인증 불필요 — 우리 `/api/**` 호출. */
export async function publicFetch<T>(
  path: string,
  schema: ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const json = await fetchEnvelope<T>(path, {
    ...init,
    headers: baseHeaders(init),
    signal: init?.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  return parseOrThrow(schema, unwrap(json));
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
    return fetchEnvelope<T>(path, {
      ...init,
      headers: {
        ...baseHeaders(init),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: init?.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  };

  try {
    return parseOrThrow(schema, unwrap(await doFetch()));
  } catch (e) {
    if (!(e instanceof ApiError) || e.statusCode !== 401) throw e;

    const refreshed = await tryRefresh();
    if (!refreshed) {
      clearAccessToken();
      throw new ApiError(401, '로그인이 만료되었습니다. 다시 로그인해주세요.');
    }
    return parseOrThrow(schema, unwrap(await doFetch()));
  }
}

// SessionBootstrap(부팅 시 무음 재발급)과 privateFetch 의 401 인터셉터가 페이지 진입 직후
// 동시에 이 함수를 부를 수 있다(예: /cart — useSession 마운트 + useCart 의 첫 401 이 같은
// 틱에 몰림). refresh_token 은 서버에서 1회용으로 회전되므로, 중복 호출하면 먼저 도착한
// 요청은 성공하고 뒤따라온 요청은 "이미 쓴 토큰"으로 거부당해 방금 심어진 새 쿠키를
// clearRefreshTokenCookie 로 지워버린다(2026-09-22 실제 재현·확인). in-flight 프로미스를
// 공유해 동시 호출을 네트워크 요청 1개로 합친다.
let refreshPromise: Promise<boolean> | null = null;

function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST' });
      if (!res.ok) return false;
      const json = (await res.json()) as ApiEnvelope<unknown>;
      const { accessToken } = SpringRefreshDataSchema.parse(json.data);
      setAccessToken(accessToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// --- 엔드포인트 함수 (api-convention §1·§8 — 훅은 이 함수를 호출, publicFetch 직접 호출 금지) ---

/**
 * 소셜 로그인 URL 발급 (카카오/네이버). 로그인 전 단계라 인증 불필요.
 * `returnTo` — 로그인 완료 후 되돌아갈 내부 상대경로(선택). Spring 이 쿠키에 담아두고
 * 콜백 리다이렉트 쿼리로 되돌려준다(BE-16 검증 대상 — 여기서도 validate 되지만 값이
 * 이상하다고 로그인 자체를 막지는 않는다).
 */
export function requestSocialLoginUrl(provider: OAuthProvider, returnTo?: string) {
  return publicFetch(`/api/auth/oauth/${provider}`, SpringLoginUrlDataSchema, {
    method: 'POST',
    body: JSON.stringify(returnTo ? { returnTo } : {}),
  });
}

/**
 * 로그아웃(마이컬리 홈 "계정" 섹션, #148). 서버 세션 정리가 실패해도 로컬 accessToken은
 * 항상 지운다 — 로그아웃 버튼을 누른 사용자 입장에선 이 브라우저에서 로그인 상태가
 * 남아있으면 안 되기 때문(`/api/auth/logout` 라우트 핸들러가 refresh_token 쿠키 쪽의
 * 같은 보장을 담당한다).
 */
export async function logout(): Promise<void> {
  try {
    await privateFetch('/api/auth/logout', SpringLogoutDataSchema, { method: 'POST' });
  } finally {
    clearAccessToken();
  }
}

/** 검색 결과 상품 목록 조회. 로그인 여부와 무관하게 노출되는 공개 데이터. */
export function searchProducts(params: ProductListParams) {
  const query = new URLSearchParams({ query: params.query, sort: params.sort });
  if (params.brand) query.set('brand', params.brand);
  if (params.price) query.set('price', params.price);
  if (params.storageType) query.set('storageType', params.storageType);
  if (params.categoryId) query.set('categoryId', params.categoryId);
  return publicFetch(`/api/products?${query}`, ProductListResponseSchema);
}

/** 검색 결과 필터 바텀시트(브랜드/가격/유형)용 옵션 조회(#128). */
export function getProductFilters(keyword: string) {
  const query = new URLSearchParams({ keyword });
  return publicFetch(`/api/products/filters?${query}`, ProductFiltersSchema);
}

/** 필터 바텀시트 "카테고리" 탭용 최상위 카테고리 목록 조회. 검색어와 무관, 파라미터 없음(#128). */
export function getProductCategories() {
  return publicFetch('/api/products/categories', ProductCategoryListSchema);
}

/** 검색창 자동완성 — 타이핑 중인 검색어로 제안 키워드 목록을 조회한다. */
export function getProductAutocomplete(keyword: string) {
  const query = new URLSearchParams({ keyword });
  return publicFetch(`/api/products/autocomplete?${query}`, ProductAutocompleteResponseSchema);
}

/** 상품 상세 조회. 로그인 여부와 무관하게 노출되는 공개 데이터. */
export function fetchProductDetail(productId: string) {
  return publicFetch(`/api/products/${productId}`, ProductDetailSchema);
}

/**
 * AI product_id → BE 상품 매핑 조회(이슈 #203). AI 추천·My냉장고·부족재료 응답의
 * `product_id`를 실제로 조회·장바구니에 담기 전에 반드시 거쳐야 한다 — BE 상품의 PK와
 * 값 공간이 다르다. 로그인 여부와 무관하게 노출되는 공개 데이터.
 */
export function fetchProductsByAi(aiProductIds: Array<string | number>) {
  const query = aiProductIds.map(String).join(',');
  return publicFetch(
    `/api/products/by-ai?aiProductIds=${encodeURIComponent(query)}`,
    ProductsByAiResponseSchema,
  );
}

/** 홈 화면 퀵메뉴 + 진열 섹션 조회. 로그인 여부와 무관하게 노출되는 공개 데이터. */
export function fetchHomeRecommendations() {
  return publicFetch('/api/products/home-recommendations', HomeRecommendationsResponseSchema);
}

/** 장바구니 조회(배송 그룹별). */
export function getCart() {
  return privateFetch('/api/cart', CartResponseSchema);
}

/** 장바구니 상품 담기(다건) — 이미 담긴 상품이면 서버가 수량을 합산한다. */
export function addCartItems(body: AddCartItemsRequest) {
  return privateFetch('/api/cart/items', CartResponseSchema, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * 장바구니 상품 수량 변경 — api-convention §7 유일한 Optimistic Update 예외 대상.
 * 경로 파라미터는 `productId` 다(`CartService.updateItemQuantity` 가 `(cartId, productId)`
 * 로 항목을 찾는다 — `cartItemId` 를 보내면 다른 상품을 건드리거나 404 가 난다).
 */
export function updateCartItemQuantity(productId: number, body: UpdateCartItemQuantityRequest) {
  return privateFetch(`/api/cart/items/${productId}`, CartVoidResponseSchema, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/** 장바구니 상품 삭제(단일·다건 공통) — `productIds` 배열. */
export function removeCartItems(body: RemoveCartItemsRequest) {
  return privateFetch('/api/cart/items', RemoveCartItemsResponseSchema, {
    method: 'DELETE',
    body: JSON.stringify(body),
  });
}

/** 장바구니 배송지 변경. */
export function updateCartDeliveryAddress(addressId: number) {
  return privateFetch('/api/cart/delivery-address', DeliveryAddressResponseSchema, {
    method: 'PUT',
    body: JSON.stringify({ addressId }),
  });
}

/** 배송지 목록 조회. */
export function getAddresses() {
  return privateFetch('/api/addresses', AddressListResponseSchema);
}

/** 마이컬리 홈 인사말(닉네임)에 쓰는 회원 프로필 조회. */
export function fetchUserProfile() {
  return privateFetch('/api/users/profile', UserProfileResponseSchema);
}

/** 배송지 추가. */
export function createAddress(body: SaveAddressRequest) {
  return privateFetch('/api/addresses', CreateAddressResponseSchema, {
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

/**
 * Toss successUrl 착지 후 결제 승인. Spring `POST /api/v1/payments/checkout`.
 * `idempotencyKey` 를 헤더가 아니라 본문에 실어 보낸다 — CloudFront가 브라우저→우리
 * 서버 구간에서 커스텀 헤더를 걸러내 Route Handler가 못 받는 사례가 확인됐다(이슈 #197).
 * 서버→Spring 구간(`springCheckoutHeaders`)은 CloudFront를 안 거치므로 거기서 헤더로
 * 다시 실어 보낸다.
 */
export function confirmPayment(body: ConfirmPaymentRequest) {
  const parsed = ConfirmPaymentRequestSchema.parse(body);
  return privateFetch('/api/payments/checkout', CheckoutPaymentResponseSchema, {
    method: 'POST',
    body: JSON.stringify(parsed),
  });
}

/** 영수증 조회. `GET /api/v1/payments/{payment_id}/receipt`. */
export function getPaymentReceipt(paymentId: number) {
  return privateFetch(
    `/api/payments/${encodeURIComponent(String(paymentId))}/receipt`,
    PaymentReceiptSchema,
  );
}

/** 주문서 생성(체크아웃) — 장바구니에서 선택한 상품으로 실제 주문을 만든다(#126). */
export function checkoutOrder(body: CheckoutOrderRequest) {
  return privateFetch('/api/orders/checkout', CheckoutOrderResponseSchema, {
    method: 'POST',
    body: JSON.stringify(CheckoutOrderRequestSchema.parse(body)),
  });
}

/** 주문 결제 요청 — 결제하기 직전 주문을 결제 대기 상태로 전이시킨다(#126). */
export function placeOrder(orderId: number) {
  return privateFetch('/api/orders/place-order', PlaceOrderResponseSchema, {
    method: 'POST',
    body: JSON.stringify(PlaceOrderRequestSchema.parse({ orderId })),
  });
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

/** My냉장고 품목 목록. AI 파트 FRIDGE-01(리뷰중, 이슈 #138). */
export function fetchFridgeItems() {
  return privateFetch('/api/fridge', FridgeListResponseSchema);
}

/** My냉장고 품목 삭제. AI 파트 FRIDGE-04(리뷰중, 이슈 #138). */
export function deleteFridgeItem(productId: string) {
  return privateFetch(`/api/fridge/${encodeURIComponent(productId)}`, FridgeDeleteResponseSchema, {
    method: 'DELETE',
  });
}

/**
 * My냉장고 기반 AI 추천 레시피. AI 파트 RECO-02(개발완료, 이슈 #138). 데이터 계층만 —
 * 아직 화면에 연결되지 않았다(types/recipe.ts 상단 주석 참고).
 */
export function fetchMyRecipeRecommendations(params: Partial<MyRecipeRecommendationParams> = {}) {
  const query = new URLSearchParams();
  if (params.limit != null) query.set('limit', String(params.limit));
  const qs = query.toString();
  return privateFetch(
    `/api/recommendations/my-recipes${qs ? `?${qs}` : ''}`,
    MyRecipeRecommendationsResponseSchema,
  );
}

/** 레시피 상세. AI 파트 RECIPE-01(개발완료, 이슈 #140). 비로그인도 조회 가능. */
export function fetchRecipeDetail(recipeId: string) {
  return publicFetch(`/api/recipes/${encodeURIComponent(recipeId)}`, RecipeDetailSchema);
}

/**
 * 부족 재료 상품 추천. AI 파트 RECIPE-03(개발완료, 이슈 #140). `privateFetch` 를 쓰지만
 * 비로그인도 허용(우리 Route Handler 가 401 로 막지 않음) — 로그인 상태면 냉장고
 * 보유분까지 반영된다(명세 §04-2).
 */
export function fetchMissingProducts(
  recipeId: string,
  params: Partial<MissingProductsParams> = {},
) {
  const query = new URLSearchParams();
  if (params.baseProductId != null) query.set('baseProductId', String(params.baseProductId));
  if (params.maxPerIngredient != null) {
    query.set('maxPerIngredient', String(params.maxPerIngredient));
  }
  const qs = query.toString();
  return privateFetch(
    `/api/recipes/${encodeURIComponent(recipeId)}/missing-products${qs ? `?${qs}` : ''}`,
    MissingProductsResponseSchema,
  );
}

/** 찜한 레시피 목록. AI 파트 FAV-01(구현됨, 이슈 #152). */
export function fetchFavoriteRecipes(params: Partial<FavoriteRecipeListParams> = {}) {
  const query = new URLSearchParams();
  if (params.limit != null) query.set('limit', String(params.limit));
  const qs = query.toString();
  return privateFetch(
    `/api/favorite-recipes${qs ? `?${qs}` : ''}`,
    FavoriteRecipeListResponseSchema,
  );
}

/** 레시피 찜 추가. AI 파트 FAV-02(구현됨, 이슈 #152). */
export function addFavoriteRecipe(recipeId: string) {
  return privateFetch(
    `/api/favorite-recipes/${encodeURIComponent(recipeId)}`,
    FavoriteRecipeSummarySchema,
    { method: 'POST' },
  );
}

/** 레시피 찜 취소. AI 파트 FAV-03(구현됨, 이슈 #152). */
export function removeFavoriteRecipe(recipeId: string) {
  return privateFetch(
    `/api/favorite-recipes/${encodeURIComponent(recipeId)}`,
    FavoriteRecipeDeleteResponseSchema,
    { method: 'DELETE' },
  );
}

/** 최근 본 레시피 목록. AI 파트 RECENT-01(구현됨, 이슈 #153). */
export function fetchRecentRecipes(params: Partial<RecentRecipeListParams> = {}) {
  const query = new URLSearchParams();
  if (params.limit != null) query.set('limit', String(params.limit));
  const qs = query.toString();
  return privateFetch(`/api/recent-recipes${qs ? `?${qs}` : ''}`, RecentRecipeListResponseSchema);
}

/** 레시피 조회 기록. AI 파트 RECENT-02(구현됨, 이슈 #153). */
export function recordRecentRecipe(recipeId: string) {
  return privateFetch(
    `/api/recent-recipes/${encodeURIComponent(recipeId)}`,
    RecentRecipeSummarySchema,
    { method: 'POST' },
  );
}

/**
 * 최근 본 레시피 선택 삭제. AI 파트 RECENT-03(리뷰중, 이슈 #177). 서버 PK는 정수라
 * 문자열로 들고 있던 `recipe_id`를 다시 숫자로 변환해 보낸다.
 */
export function deleteRecentRecipes(recipeIds: string[]) {
  return privateFetch('/api/recent-recipes', RecentRecipeDeleteResponseSchema, {
    method: 'DELETE',
    body: JSON.stringify(
      RecentRecipeDeleteRequestSchema.parse({ recipe_ids: recipeIds.map(Number) }),
    ),
  });
}

/** 상품 보관 가이드. AI 파트 PROD-03(개발완료, 이슈 #142). 비로그인도 조회 가능. */
export function fetchStorageGuide(productId: string) {
  return publicFetch(
    `/api/products/${encodeURIComponent(productId)}/storage-guide`,
    StorageGuideResponseSchema,
  );
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
