# API 컨벤션 (api-convention)

> 스코프(1) 실제 문서. 이 문서는 **API 계층의 표준**을 정의한다.
> 실제 Route Handler / 훅 / api-client 구현 코드는 다음 단계 작업이며, 이 문서는 그 구현이 따라야 할 명세다.

---

## 1. 아키텍처 개요

데이터는 항상 아래 단방향 흐름을 따른다. 계층을 건너뛰지 않는다.

```
[외부 API]
   │
   ▼
Route Handler        src/app/api/**/route.ts       ← BFF. 외부 API 프록시 + 인증/쿠키 처리
   │  (fetch)
   ▼
types (Zod)          src/types/<domain>.ts         ← Zod 로 응답/요청 검증, 타입 파생
   │  (parse)
   ▼
apiClient            src/lib/apiClient.ts          ← publicFetch / privateFetch 래퍼 + 401 재발급
   │
   ▼
query hooks          src/hooks/<domain>/           ← useQuery / useMutation, 쿼리 키 팩토리
   │
   ▼
컴포넌트             src/components/{atoms,molecules,organisms}/  ← 훅만 호출. fetch 직접 호출 금지
```

| 계층          | 위치                                                   | 책임                                                   | 하면 안 되는 것                            |
| ------------- | ------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------ |
| Route Handler | `src/app/api/**/route.ts`                              | 외부 API 호출, 토큰/쿠키 주입, 에러 정규화             | UI 로직, 비즈니스 규칙 계산                |
| types         | `src/types/<domain>.ts`                                | Zod 스키마 정의, `z.infer` 타입 export                 | fetch 호출                                 |
| apiClient     | `src/lib/apiClient.ts`                                 | HTTP 래퍼, 엔드포인트 함수, 응답 `parse`, 401 인터셉터 | React 훅 사용, 컴포넌트 import             |
| query hook    | `src/hooks/<domain>/`                                  | `useQuery`/`useMutation`, 쿼리 키, 캐시 정책           | JSX 렌더                                   |
| 컴포넌트      | `src/components/{atoms,molecules,organisms}/<domain>/` | 렌더링, 훅 호출                                        | `fetch` 직접 호출, 쿼리 키 문자열 하드코딩 |
| 에러          | `src/errors/ApiError.ts`                               | 실패 응답 → `ApiError(statusCode, message)` 변환       | —                                          |

**규칙**: 컴포넌트는 절대 `fetch` 를 직접 호출하지 않는다. 반드시 query hook 을 통한다.

---

## 2. Provider 합성 위치 규칙

- 모든 클라이언트 Provider 는 **`src/app/providers.tsx`** 한 곳에서만 합성한다.
- `src/app/layout.tsx` 는 `<Providers>` 하나만 감싼다. layout 에 Provider 를 직접 추가하지 않는다.
- 합성 순서: **서버 상태(TanStack Query) → 클라 UI 상태(Zustand) → 표현 계층(테마/토스트/모달)**.
- 새 Provider 추가 시:
  1. Provider 구현은 `src/providers/<name>-provider.tsx` 에 `"use client"` 로 작성.
  2. `providers.tsx` 의 합성 트리에 순서 규칙에 맞게 삽입.
  3. PR 설명에 "왜 이 순서인지" 한 줄 기록.

```tsx
// src/app/providers.tsx
'use client';
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <UIStoreProvider>{children}</UIStoreProvider>
    </QueryProvider>
  );
}
```

---

## 3. HTTP 래퍼: publicFetch / privateFetch

`src/lib/apiClient.ts` 에 두 개의 래퍼만 둔다. 컴포넌트/훅은 이 둘만 사용한다.
(Route Handler 응답 봉투 빌더 `ok()` / `fail()` 는 `src/lib/apiResponse.ts` — §6.)

| 래퍼           | 인증             | 사용처                                              | 실행 위치                     | 특징                                    |
| -------------- | ---------------- | --------------------------------------------------- | ----------------------------- | --------------------------------------- |
| `publicFetch`  | 없음             | 상품 목록/상세, 카테고리, 검색 등 비로그인 허용 API | 서버·클라 모두                | 캐시 적극 활용 (`next: { revalidate }`) |
| `privateFetch` | 필수 (쿠키/토큰) | 장바구니, 주문, 마이페이지, 위시리스트              | 원칙적으로 Route Handler 경유 | 401 시 refresh 시도 → 실패 시 로그아웃  |

규칙:

- 브라우저에서 외부 API 를 직접 부르지 않는다. `privateFetch` 는 항상 우리 Route Handler(`/api/**`)를 호출하고, Route Handler 가 서버에서 외부 API + 토큰을 처리한다.
- `publicFetch` 도 기본은 Route Handler 경유. 순수 정적 데이터에 한해 RSC 에서 외부 API 직접 호출 허용(리뷰에서 판단).
- 공통 헤더(`Content-Type`, 추적 헤더), 타임아웃, 에러 → `ApiError` 정규화는 래퍼 내부에서 처리.

```ts
// src/lib/apiClient.ts (명세 — 구현은 다음 단계)
export async function publicFetch<T>(
  path: string,
  schema: ZodType<T>,
  init?: RequestInit & { next?: NextFetchRequestConfig },
): Promise<T> {
  const res = await fetch(buildUrl(path), { ...init, headers: baseHeaders(init) });
  const json = await res.json();
  if (!res.ok) throw ApiError.fromResponse(res.status, json);
  return schema.parse(unwrap(json)); // 공용 응답 포맷의 data 를 꺼내 검증
}
```

---

## 4. 쿼리 키 팩토리 규칙

- 쿼리 키 문자열을 컴포넌트/훅에 **하드코딩 금지**. 도메인별 `queryKeys` 팩토리에서만 생성.
- 위치: `src/hooks/<domain>/queryKeys.ts`
- 구조: `[domain, entity, params]` 순의 배열. 계층적으로 좁혀지도록 작성해 부분 무효화가 가능하게 한다.

```ts
// src/hooks/product/queryKeys.ts
export const productKeys = {
  all: ['product'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductListParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};
```

무효화 예:

- 특정 상품만: `queryClient.invalidateQueries({ queryKey: productKeys.detail(id) })`
- 목록 전체: `queryClient.invalidateQueries({ queryKey: productKeys.lists() })`

---

## 5. Zod 스키마 명명·위치 규칙

| 항목          | 규칙                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| 위치          | `src/types/<domain>.ts` — 도메인당 1파일 (`product.ts`, `cart.ts`, `order.ts` …)                             |
| 공용          | 공용 원자 스키마(`MoneySchema`, `PaginationSchema`)는 `src/types/common.ts`                                  |
| 스키마 변수명 | `PascalCase` + 접미사. 요청: `CreateOrderRequestSchema`, 응답: `ProductSchema` / `ProductListResponseSchema` |
| 파생 타입     | `export type Product = z.infer<typeof ProductSchema>` — 타입명은 접미사 없이                                 |
| 역할          | 지난 프로젝트의 `contracts/`·`types/` 역할을 `src/types/` 하나로 통합                                        |
| 날짜/숫자     | 서버가 문자열로 주면 `z.coerce.date()` / `z.coerce.number()` 로 파싱 계층에서 정규화                         |

```ts
// src/types/product.ts
import { z } from 'zod';
import { MoneySchema } from './common';

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: MoneySchema,
  thumbnailUrl: z.string().url(),
  soldOut: z.boolean().default(false),
});
export type Product = z.infer<typeof ProductSchema>;

export const ProductListResponseSchema = z.object({
  items: z.array(ProductSchema),
  nextCursor: z.string().nullable(),
});
export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;
```

---

## 6. 공용 응답 포맷

모든 Route Handler 응답은 아래 봉투(envelope) 포맷으로 통일한다.

```jsonc
{
  "statusCode": 200, // HTTP 상태와 동일한 숫자
  "message": "OK", // 사람이 읽는 메시지 (성공/실패 모두)
  "data": {/* 실제 페이로드, 없으면 null */},
}
```

```ts
// src/lib/apiResponse.ts (명세 — Route Handler 전용)
import { NextResponse } from 'next/server';

export type ApiEnvelope<T> = { statusCode: number; message: string; data: T };

export function ok<T>(data: T, message = 'OK', statusCode = 200) {
  return NextResponse.json<ApiEnvelope<T>>({ statusCode, message, data }, { status: statusCode });
}

export function fail(statusCode: number, message: string) {
  return NextResponse.json<ApiEnvelope<null>>(
    { statusCode, message, data: null },
    { status: statusCode },
  );
}
```

```ts
// src/app/api/products/route.ts (명세 예시)
export async function GET(req: NextRequest) {
  const params = ProductListParamsSchema.parse(Object.fromEntries(req.nextUrl.searchParams));
  const raw = await publicFetch(`/v1/products?${toQuery(params)}`, ProductListResponseSchema);
  return ok(raw);
}
```

- api-client 는 봉투에서 `data` 만 꺼내 스키마로 검증한 뒤 반환한다(`unwrap`).
- 에러 봉투(`data: null`)는 `ApiError(statusCode, message)` 로 변환해 throw → 훅의 `error` 로 전달.

---

## 7. Optimistic Update 정책

**기본값: Optimistic Update 를 하지 않는다.** mutation 성공 후 관련 쿼리를 `invalidateQueries` 로 무효화해 서버 상태를 다시 가져온다.

```ts
// 기본 패턴
useMutation({
  mutationFn: addWishlist,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: wishlistKeys.all }),
});
```

**유일한 예외: 장바구니(cart) 수량 증감.** 그 외 도메인에 Optimistic Update 를 추가하려면 PR 에서 아래 3가지를 먼저 답한다.

1. **왜 지연이 UX 를 해치는가?** (장바구니는 담기/수량조절이 연속적이고 즉시 반영이 기대되는 상호작용)
2. **롤백 시나리오가 명확한가?** `onError` 에서 이전 스냅샷으로 정확히 되돌릴 수 있는가? (`onMutate` 에서 `cancelQueries` + `getQueryData` 스냅샷 필수)
3. **서버가 최종 판정하는 값(재고, 가격, 프로모션)을 낙관적으로 표시했다가 어긋나면?** 최종 `onSettled` invalidate 로 반드시 서버 값에 수렴시키는가?

세 가지에 모두 명확히 답하지 못하면 Optimistic Update 를 쓰지 않는다.

```ts
// 장바구니 예외 패턴 (명세)
useMutation({
  mutationFn: updateCartItemQty,
  onMutate: async (next) => {
    await queryClient.cancelQueries({ queryKey: cartKeys.detail() });
    const prev = queryClient.getQueryData(cartKeys.detail());
    queryClient.setQueryData(cartKeys.detail(), (c) => applyQty(c, next));
    return { prev };
  },
  onError: (_e, _v, ctx) => queryClient.setQueryData(cartKeys.detail(), ctx?.prev),
  onSettled: () => queryClient.invalidateQueries({ queryKey: cartKeys.detail() }),
});
```

---

## 8. 새 엔드포인트 추가 체크리스트

- [ ] `src/types/<domain>.ts` 에 요청/응답 Zod 스키마 추가 (명명 규칙 §5)
- [ ] `src/app/api/<domain>/**/route.ts` Route Handler 작성, 공용 응답 포맷(`ok`/`fail`) 사용
- [ ] Route Handler 에서 외부 API 호출은 `publicFetch`/`privateFetch` 로, 응답을 스키마로 `parse`
- [ ] `src/lib/apiClient.ts` 에 엔드포인트 함수 추가 (컴포넌트에서 쓰기 좋은 시그니처)
- [ ] `src/hooks/<domain>/queryKeys.ts` 에 쿼리 키 추가 (계층 구조 §4)
- [ ] `src/hooks/<domain>/` 에 `useXxxQuery` / `useXxxMutation` 훅 작성
- [ ] mutation 은 기본 `invalidateQueries`. Optimistic 필요 시 §7 의 3질문 PR 답변
- [ ] 인증 필요 여부 확인 → `privateFetch` + Route Handler 경유
- [ ] 에러 경로(4xx/5xx) 처리 확인: 훅 `error` 로 전달되는지, 화면 표시 방식 합의
- [ ] 이 훅을 소비하는 **화면/organism 컨테이너**의 로딩·에러 상태 UI 정의 (리스트 응답이면 빈 상태도). 표현 컴포넌트가 아니라 컨테이너 계층 — structure §6-1, code-style §3-1
- [ ] `security-convention` 의 FE-03(민감정보 로깅 금지), FE-07(응답 검증) 위반 없는지 확인

---

## 9. 안티패턴 (리뷰에서 반려)

| 안티패턴                                             | 대신                       |
| ---------------------------------------------------- | -------------------------- |
| 컴포넌트에서 `fetch("/api/...")` 직접 호출           | query hook 사용            |
| `useQuery(["cart"], ...)` 처럼 키 하드코딩           | `cartKeys.detail()`        |
| 스키마 검증 없이 `res.json()` 결과를 그대로 사용     | `Schema.parse(...)`        |
| Route Handler 없이 브라우저에서 외부 API + 토큰 호출 | `/api/**` 경유             |
| mutation 후 화면 수동 setState 로 동기화             | `invalidateQueries`        |
| 전역 Zustand 스토어에 서버 응답 저장                 | TanStack Query 캐시에 보관 |
