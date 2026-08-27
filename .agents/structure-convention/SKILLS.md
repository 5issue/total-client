# 구조 컨벤션 (structure-convention)

> 스코프(1) 실제 문서. 폴더 구조, 라우트 맵, 컴포넌트 계층(Atomic Design 하이브리드), 렌더링 전략의 표준.
> 현재 저장소에는 라우트 그룹 + 페이지 스켈레톤, 컴포넌트 계층 폴더(`.gitkeep`)까지 존재한다. 실제 화면/컴포넌트 구현은 다음 단계.
> 근거 설계: **"컴포넌트 계층 · 라우팅 구조 설계 0.1v"** (마켓컬리 비교분석 기반).

---

## 1. 라우트 그룹 원칙

App Router 라우트 그룹으로 **레이아웃 경계**를 나눈다. URL 에는 그룹명이 노출되지 않는다.

| 그룹 | 레이아웃 성격 | 인증 |
|---|---|---|
| `(auth)` | 헤더/푸터 없는 인증 전용 화면 | 비로그인 전용 |
| `(shop)` | `Header`(+장바구니 아이콘) + `BottomNav`(홈/검색/AI/마이컬리) | 대부분 공개, 일부 경로만 보호 |

- 인증 가드는 **`src/middleware.ts`** 가 담당한다. `matcher: ["/checkout/:path*", "/mypage/:path*"]` — 이 경로는 미인증 시 `/login?redirect=` 로 이동.
- middleware 는 UX 목적이고 **실제 인가는 서버(Route Handler/외부 API)가 매 요청 검증**한다 (security-convention FE-15).
- 그룹별 `layout.tsx` 는 그 그룹의 공통 셸만 담당한다. 공유 UI 는 `components/` 로 올린다.

---

## 2. 라우트 맵

```
src/
├── middleware.ts                        # /checkout/:path*, /mypage/:path*
└── app/
    ├── layout.tsx                       # 루트: <html>, <SerwistProvider>, <Providers>
    ├── providers.tsx                    # 모든 클라 Provider 합성 (여기서만)
    ├── manifest.ts                      # PWA manifest (App Router 네이티브)
    ├── sw.ts                            # 서비스 워커 소스 (Serwist)
    ├── serwist/[path]/route.ts          # @serwist/turbopack Route Handler
    ├── api/                             # ⏳ Route Handler(BFF) — 다음 단계
    │   └── health/route.ts              # ⏳ k8s probe (/api/health)
    ├── (auth)/
    │   ├── login/page.tsx               # 로그인 (US-AUTH-003: 카카오/네이버)
    │   ├── signup/page.tsx              # 회원가입
    │   └── callback/[provider]/route.ts # OAuth 콜백 (provider: kakao | naver)
    └── (shop)/
        ├── layout.tsx                   # Header(+장바구니 아이콘), BottomNav
        ├── page.tsx                     # 홈 (SL-HOME 001~004, 006)
        ├── search/page.tsx              # 검색
        ├── ai/page.tsx                  # AI 탭 — 레시피 추천 등 (백엔드 명세 대기)
        ├── products/page.tsx            # 상품 컬렉션 리스트 (SL-LIST 001~005)
        ├── products/[productId]/page.tsx# 상품 상세 (SL-COM, SL-PROD, SL-SPEC)
        ├── cart/page.tsx                # 장바구니 (SL-CART 001~004, 007) — 진입은 헤더 아이콘
        ├── checkout/
        │   ├── page.tsx                 # 주문서 작성 (SL-ORD 001~004, 008)
        │   └── complete/page.tsx        # 주문 완료 (결제 영수증 조회 API)
        └── mypage/
            ├── page.tsx                 # 마이컬리 홈 (US-MY-001)
            ├── addresses/page.tsx       # 배송지 관리 (US-ADDR 001~002)
            └── profile/page.tsx         # 회원 프로필 (US-PROF-001, US-AUTH-005)
```

| 화면 | 실제 URL | 렌더링 전략 | 보호 | 책임 지표 |
|---|---|---|---|---|
| 홈 | `/` | RSC + 부분 CSR(개인화) | 공개 | LCP < 2.5s, CLS < 0.1 |
| 검색 | `/search` | RSC(쿼리 파라미터) | 공개 | 빈 결과 UI 필수, TTFB < 0.8s |
| AI | `/ai` | 뼈대만 (백엔드 명세 대기) | 공개 | — |
| 상품 컬렉션 리스트 | `/products` | RSC + 무한스크롤(클라, 미확정) | 공개 | 첫 페이지 SSR, 이미지 종횡비 고정 → CLS < 0.1 |
| 상품 상세 | `/products/[productId]` | RSC(정적 우선) + 클라(담기) | 공개 | LCP < 2.5s, 대표 이미지 `priority`, 원본 ≤ 200KB |
| 장바구니 | `/cart` | CSR(로그인 데이터) | 공개(게스트 여부 미확정) | 수량 변경 반영 < 100ms (Optimistic — api-convention §7) |
| 주문서 작성 | `/checkout` | CSR + 서버 액션 | **보호** | 폼 검증 즉시성, 3단계 API(주문서생성→결제승인→주문확정, 미확정) |
| 주문 완료 | `/checkout/complete` | RSC | **보호** | 영수증 조회 API |
| 마이컬리 홈 | `/mypage` | RSC + 부분 CSR | **보호** | 로그인 가드 |
| 배송지 관리 | `/mypage/addresses` | CSR | **보호** | 기본 배송지 일관성 |
| 회원 프로필 | `/mypage/profile` | RSC + CSR(수정) | **보호** | 재인증(ReauthSheet) 후 수정 |
| 로그인 | `/login` | CSR(폼) | 비로그인 전용 | 접근성 목표(§code-style 5), 소셜 로그인 |
| 회원가입 | `/signup` | CSR(폼) | 비로그인 전용 | 단계별 검증, `user-scalable` 제한 금지 |

**렌더링 기본값**: RSC. `"use client"` 는 상호작용/브라우저 API/상태가 필요한 잎 컴포넌트에만.

---

## 3. 컴포넌트 계층 — Atomic Design 하이브리드 (3계층)

Atomic Design 은 원래 5단계(atoms → molecules → organisms → templates → pages)지만,
**templates / pages 는 Next.js App Router 의 `layout.tsx` / `page.tsx` 가 이미 그 역할**을 하므로
`components/` 는 **3계층만** 둔다.

```
src/components/
├── atoms/                     # Button, Input, Badge, Spinner, Typography ...
├── molecules/
│   ├── shared/                # SearchBar, PriceTag, QuantityStepper, FilterChip
│   ├── product/               # ProductThumbnail, WishlistToggleButton, DeliveryTypeBadge
│   ├── cart/                  # CartLineItem, CartTemperatureSectionHeader
│   └── auth/                  # SocialLoginButton, ReauthPasswordField
└── organisms/
    ├── shared/                # Header, Footer, BottomNav, FilterSheet
    ├── home/                  # CategoryTabs, QuickMenuSection, DisplaySectionList, HeroBanner
    ├── product/               # ProductGrid, ProductDetailPanel, ProductOptionSheet
    ├── cart/                  # CartList(온도별 그룹핑), CartSummary
    ├── checkout/              # CheckoutStepper, DeliveryRequestForm, PaymentMethodList
    ├── mypage/                # MyKurlyHomeSummary, AddressManageList, ProfileForm
    ├── ai/                    # AIRecipePanel (백엔드 명세 대기, 뼈대만)
    └── auth/                  # SocialLoginPanel, ReauthSheet
```

| 계층 | 정의 | 규칙 | 예 |
|---|---|---|---|
| **atoms** | 더 못 쪼개는 최소 UI. 도메인 지식 없음. | 서버/외부 상태 접근 금지, props 로만. 대부분 `"use client"` 불필요(상호작용 있으면 필요). | `Button`, `Input`, `Badge`, `Spinner` |
| **molecules** | atom 조합. 도메인별로 분류(`shared`/`product`/`cart`/`auth`). | fetch 금지. 도메인 데이터 타입(`types/`)은 참조 가능. | `PriceTag`, `ProductThumbnail`, `CartLineItem` |
| **organisms** | molecule/atom 조합, 화면의 한 구획. 도메인별 분류. | 여기까지도 fetch 직접 금지 — `hooks/<domain>` 훅을 받아 조립. RSC 우선. | `Header`, `ProductGrid`, `CartList` |
| (templates/pages) | = `app/**/layout.tsx`, `app/**/page.tsx` | 로직 없이 organism 조합 + 훅 연결만. | `(shop)/page.tsx` |

배치 규칙:
- **2개 이상 도메인이 공유하면 `shared/`**, 한 도메인 전용이면 해당 도메인 폴더.
- molecule 이 다른 molecule 을 쓰기 시작하면 organism 후보다.
- organism 이 커지면 잘게 나눈다(한 파일 200줄 목표).
- 컴포넌트 파일은 `PascalCase.tsx`, 스토리는 co-location(`Xxx.stories.tsx` — git-convention 스코프2).

---

## 4. 전체 폴더 구조

```
src/
├── middleware.ts                # 인증 가드 (matcher: /checkout, /mypage)
├── app/                         # 라우트 맵(§2) 그대로
├── components/                  # Atomic Design 3계층(§3)
│   ├── atoms/
│   ├── molecules/{shared,product,cart,auth}/
│   └── organisms/{shared,home,product,cart,checkout,mypage,ai,auth}/
├── hooks/                       # TanStack Query 커스텀 훅 — 도메인별 폴더
│   ├── product/                 # useProducts, useProductDetail, useProductFilters
│   ├── cart/                    # useCart, useUpdateCartQuantity
│   ├── order/                   # useCreateOrderSheet, useCancelOrder, useReturnOrder(미확정)
│   ├── payment/                 # useRequestPayment, usePaymentReceipt(미확정)
│   ├── address/                 # useAddresses, useSetDefaultAddress
│   ├── user/                    # useProfile
│   ├── auth/                    # useSocialLogin, useReauthPassword
│   └── useUIStore.ts            # (범용) Zustand UI 스토어 selector 훅
├── stores/                      # Zustand — 순수 클라이언트 UI 상태만 (서버 상태 금지)
│   ├── uiStore.ts               # 마운트당 생성 팩토리 + Provider + 훅까지 배선된 참조 구현
│   ├── useFilterUIStore.ts      # 필터 바텀시트 임시 선택값 (팩토리 존재, Provider/훅은 FilterSheet 구현 시)
│   └── useAuthTokenStore.ts     # Access Token 메모리 보관 (팩토리 존재, 배선은 auth 구현 시)
├── types/                       # Zod 스키마 + 추론 타입 (도메인별 1파일)
│   ├── product.ts  cart.ts  order.ts  payment.ts  address.ts  user.ts  auth.ts   # ⏳
├── providers/                   # Provider 구현 ("use client")
│   ├── QueryProvider.tsx
│   └── UIStoreProvider.tsx
├── lib/
│   ├── env.ts                   # Zod 런타임 env 검증
│   ├── queryClient.ts           # QueryClient 팩토리 (서버/브라우저 분기)
│   ├── apiClient.ts             # ⏳ fetch 래퍼 + 401 재발급 인터셉터
│   ├── formatters.ts            # 가격/날짜 포맷
│   └── constants.ts
├── errors/
│   └── ApiError.ts              # 공용 응답 포맷 에러 봉투
└── styles/
    └── globals.css              # @import "tailwindcss" + @theme 토큰
```

배치 규칙:
- **수평 레이어**(Atomic `components/` + 도메인 `hooks/` + `types/`)로 나눈다. `features/` 수직 슬라이스는 쓰지 않는다.
- 도메인에 국한된 것: 컴포넌트 → `components/{molecules,organisms}/<domain>/`, 훅 → `hooks/<domain>/`, 타입 → `types/<domain>.ts`.
- 라우트 파일(`page.tsx`/`layout.tsx`)에는 로직을 두지 않는다. organism 조합 + 훅 연결만.
- `stores/` 는 팩토리만. 인스턴스는 `providers/` 가 만든다.
- 쿼리 키 팩토리는 `hooks/<domain>/queryKeys.ts` (api-convention §4).

---

## 5. 이미지 규칙: next/image + 종횡비 고정

**근거 (경쟁사 마켓컬리 실측):**

| 지표 | 실측값 | 문제 |
|---|---|---|
| 메인 상품 이미지 용량 | PNG **2.4MB** | 포맷/압축 미적용 |
| LCP | 약 **20초** (저속 3G) | 대표 이미지 최적화·우선순위 부재 |
| CLS | **0.77** | 이미지 로드 전 높이 예약 없음 |

**우리 규칙:**

1. `<img>` 직접 사용 금지 → 항상 `next/image` (`@next/next/no-img-element` 강제).
2. 이미지 컨테이너는 **종횡비를 CSS 로 먼저 고정**(`aspect-*` + `relative` + `fill`). 로드 전에도 높이 확정.
   ```tsx
   <div className="relative aspect-square w-full overflow-hidden rounded-card">
     <Image src={product.thumbnailUrl} alt={product.name} fill sizes="(max-width:768px) 50vw, 240px" />
   </div>
   ```
3. 고정 크기가 자연스러운 곳은 `width`/`height` 명시.
4. LCP 후보(상품 상세 대표 이미지, 홈 히어로)만 `priority`.
5. `next.config.ts` `images.formats = ["image/avif","image/webp"]`, 외부 도메인은 `images.remotePatterns` 등록.
6. 원본 예산: 썸네일 ≤ 60KB, 상세 대표 ≤ 200KB.
7. `alt` 필수. 장식용이면 `alt=""`.
8. 대괄호 임의값(`rounded-[--radius-card]`)이 아니라 `@theme` 생성 유틸리티(`rounded-card`).

---

## 6. 디자인 파트 협의 필요 (현재 보류)

디자인/기획 합의 전까지 확정하지 않는다. 임의 구현 금지.

| 항목 | 쟁점 | 임시 방침 |
|---|---|---|
| 목록 페이징 방식 | 무한스크롤 vs 번호 페이지네이션 vs "더보기" | `/products` 는 무한스크롤로 가정, **미확정**. 접근성·SEO 영향 큼 |
| 홈 구성 API | `/products/home-recommendations`, `/products/categories` 트리 | organism 뼈대만, API 스펙 대기 |
| AI 탭 | 레시피 추천 등 기능 범위 | 라우트(`/ai`)와 `AIRecipePanel` 뼈대만, 백엔드 명세 대기 |
| 장바구니 진입 | 페이지(`/cart`) vs 드로어 vs 둘 다 | `uiStore` 에 `isCartDrawerOpen` 뼈대만, 확정 보류 |
| 게스트 장바구니 | 비로그인 장바구니 허용 여부 | `/cart` 는 `(shop)` 공개 경로에 두되 보호 여부 재검토 |
| checkout 3단계 API | 주문서생성 → 결제승인 → 주문확정 순서·트랜잭션 | A-0-1 참고, **미확정** |
| 주문 취소/반품 | `useCancelOrder`, `useReturnOrder` | 훅 폴더만, 정책 대기 |

협의 완료 항목은 이 표에서 제거하고 본문에 반영한다.
