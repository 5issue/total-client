# 구조 컨벤션 (structure-convention)

> 스코프(1) 실제 문서. 폴더 구조, 라우트 그룹, 화면 목록, 렌더링 전략의 표준.
> 현재 저장소에는 폴더 스켈레톤(`.gitkeep`)까지만 존재한다. 실제 라우트/컴포넌트는 다음 단계.

---

## 1. 라우트 그룹 원칙

App Router 라우트 그룹으로 **레이아웃 경계**와 **인증 경계**를 나눈다. URL 에는 그룹명이 노출되지 않는다.

| 그룹 | URL 예 | 레이아웃 성격 | 인증 |
|---|---|---|---|
| `(shop)` | `/`, `/products`, `/products/[id]`, `/search`, `/category/[slug]` | 헤더 + GNB + 푸터, 장바구니 아이콘 | 비로그인 허용 |
| `(account)` | `/mypage`, `/orders`, `/orders/[id]`, `/wishlist`, `/cart`, `/checkout` | 마이페이지 사이드바 / 결제 전용 최소 레이아웃 | 로그인 필수 (middleware 가드) |
| `(auth)` | `/login`, `/signup`, `/find-password` | 헤더/푸터 없는 중앙 정렬 레이아웃 | 비로그인 전용 (로그인 시 리다이렉트) |

규칙:
- 그룹별 `layout.tsx` 는 그 그룹의 공통 셸만 담당한다.
- 인증 가드는 **`src/middleware.ts`** 에서 그룹 경로 매칭으로 처리(예: `/mypage`, `/orders`, `/checkout` → 미인증 시 `/login?redirect=`).
- `(auth)` 와 `(account)` 는 상호 배타. 로그인 상태에서 `(auth)` 진입 시 홈으로.
- 그룹 간 공유 UI 는 `src/components/` 로 올린다. 그룹 폴더에 두지 않는다.

---

## 2. MVP 화면 목록

> 렌더링 전략과 "책임 지표"는 **마켓컬리 비교분석 보고서**의 실측을 근거로 한다.
> 책임 지표 = 그 화면에서 팀이 책임지고 만족시켜야 하는 정량 목표.

| # | 화면 | 라우트 | 그룹 | 렌더링 전략 | 데이터 | 책임 지표 |
|---|---|---|---|---|---|---|
| 1 | 홈 | `/` | (shop) | RSC + 부분 CSR(개인화 영역) | 상품 큐레이션, 배너 | LCP < 2.5s, CLS < 0.1 |
| 2 | 상품 목록/카테고리 | `/category/[slug]` | (shop) | RSC + 무한스크롤(클라) | 상품 목록(cursor) | 첫 페이지 SSR, 이미지 종횡비 고정으로 CLS < 0.1 |
| 3 | 검색 결과 | `/search?q=` | (shop) | RSC(쿼리 파라미터 기반) | 검색 API | TTFB < 0.8s, 빈 결과 UI 필수 |
| 4 | 상품 상세 | `/products/[id]` | (shop) | RSC(정적 우선) + 클라(장바구니 담기) | 상품 상세, 재고 | LCP < 2.5s, 대표 이미지 `priority`, 원본 KB 예산 200KB |
| 5 | 장바구니 | `/cart` | (account) | CSR 중심(로그인 데이터) | 장바구니 | 수량 변경 반영 < 100ms (Optimistic 허용 — api-convention §7) |
| 6 | 주문/결제 | `/checkout` | (account) | CSR + 서버 액션(주문 생성) | 배송지, 결제수단 | 폼 검증 즉시성, 결제 단계 이탈률 관리 |
| 7 | 주문 목록 | `/orders` | (account) | RSC + 페이지네이션 | 주문 내역 | 로그인 가드, 빈 상태 UI |
| 8 | 주문 상세 | `/orders/[id]` | (account) | RSC | 주문 1건 | 본인 주문만(서버 검증) |
| 9 | 위시리스트 | `/wishlist` | (account) | CSR | 찜 목록 | 담기/해제 후 목록 일관성 |
| 10 | 마이페이지 | `/mypage` | (account) | RSC + 부분 CSR | 프로필 요약 | 로그인 가드 |
| 11 | 로그인 | `/login` | (auth) | CSR(폼) | 인증 API | 접근성 점수 목표(§4), 에러 메시지 명확 |
| 12 | 회원가입 | `/signup` | (auth) | CSR(폼) | 인증 API | 단계별 검증, `user-scalable` 제한 금지 |

**렌더링 기본값**: RSC(서버 컴포넌트)가 기본. `"use client"` 는 상호작용/브라우저 API/상태가 필요한 잎(leaf) 컴포넌트에만.

---

## 3. 폴더 트리 (목표 구조)

```
src/
├── middleware.ts                     # 인증 가드 (그룹 경로 매칭)
├── app/
│   ├── layout.tsx                    # 루트: <html>, <SerwistProvider>, <Providers>
│   ├── page.tsx                      # 홈 (임시: 스켈레톤)
│   ├── providers.tsx                 # 모든 클라 Provider 합성 (여기서만)
│   ├── manifest.ts                   # PWA manifest (App Router 네이티브)
│   ├── sw.ts                         # 서비스 워커 소스 (Serwist)
│   ├── serwist/[path]/route.ts       # @serwist/turbopack Route Handler
│   ├── api/                          # ⏳ Route Handler (BFF) — 다음 단계
│   │   ├── health/route.ts           # ⏳ k8s probe (/api/health)
│   │   ├── products/route.ts         # ⏳
│   │   └── cart/route.ts             # ⏳
│   ├── (shop)/
│   │   ├── layout.tsx                # ⏳ 헤더/GNB/푸터
│   │   ├── category/[slug]/page.tsx  # ⏳
│   │   ├── products/[id]/page.tsx    # ⏳
│   │   └── search/page.tsx           # ⏳
│   ├── (account)/
│   │   ├── layout.tsx                # ⏳ 마이페이지 셸
│   │   ├── cart/page.tsx             # ⏳
│   │   ├── checkout/page.tsx         # ⏳
│   │   ├── orders/page.tsx           # ⏳
│   │   └── mypage/page.tsx           # ⏳
│   └── (auth)/
│       ├── layout.tsx                # ⏳ 중앙 정렬 셸
│       ├── login/page.tsx            # ⏳
│       └── signup/page.tsx           # ⏳
├── components/
│   ├── ui/                           # 디자인 시스템 원자 (Button, Input, Dialog...) — CDD
│   └── product/                      # 상품 도메인 표시 컴포넌트 (ProductCard, PriceTag...)
├── features/                         # 도메인별 수직 슬라이스
│   └── <domain>/                     # 예: cart, order, product, auth
│       ├── components/               # 도메인 전용 컴포넌트
│       ├── hooks/                    # useXxxQuery / useXxxMutation
│       ├── query-keys.ts             # 쿼리 키 팩토리
│       └── schemas/                  # 도메인 국한 Zod 스키마 (선택)
├── hooks/                            # 범용 훅 (use-ui-store, use-media-query...)
├── stores/                           # Zustand vanilla 팩토리 (create() 싱글턴 금지)
│   └── ui-store.ts
├── providers/                        # Provider 구현 ("use client")
│   ├── query-provider.tsx
│   └── ui-store-provider.tsx
├── lib/
│   ├── env.ts                        # Zod 런타임 env 검증
│   ├── api/                          # ⏳ http.ts(publicFetch/privateFetch), response.ts, <domain>.ts
│   └── query-client.ts               # QueryClient 팩토리 (서버/브라우저 분기)
├── schemas/                          # 공용 Zod 스키마 (<domain>.schema.ts, common.schema.ts)
└── styles/
    └── globals.css                   # @import "tailwindcss" + @theme 토큰
```

배치 규칙:
- **도메인에 국한된 것은 `features/<domain>/`** 안에 모은다(수직 슬라이스). 2개 이상 도메인이 공유하면 `components/`, `hooks/`, `lib/`, `schemas/` 로 승격.
- 라우트 파일(`page.tsx`, `layout.tsx`)에는 로직을 두지 않는다. 조합만. 로직은 `features/` 로.
- `stores/` 는 팩토리만. 인스턴스는 `providers/` 가 만든다.

---

## 4. 이미지 규칙: next/image + 종횡비 고정

**근거 (경쟁사 마켓컬리 실측):**

| 지표 | 실측값 | 문제 |
|---|---|---|
| 메인 상품 이미지 용량 | PNG **2.4MB** | 포맷/압축 미적용, 모바일 데이터·디코드 비용 |
| LCP | 약 **20초** (저속 3G 기준 측정) | 대표 이미지 최적화·우선순위 부재 |
| CLS | **0.77** | 이미지 로드 전 높이 예약 없음 → 레이아웃 점프 |

**우리 규칙:**

1. `<img>` 직접 사용 금지 → 항상 `next/image` (`@next/next/no-img-element` 로 강제 — code-style-convention 매핑 표 참고).
2. 모든 이미지 컨테이너는 **종횡비를 CSS 로 먼저 고정**한다. 이미지가 로드되기 전에도 높이가 확정되어야 한다.
   ```tsx
   // 상품 카드 썸네일: 1:1 고정
   <div className="relative aspect-square w-full overflow-hidden rounded-card">
     <Image src={product.thumbnailUrl} alt={product.name} fill sizes="(max-width:768px) 50vw, 240px" />
   </div>
   ```
3. 고정 크기가 자연스러운 곳은 `width`/`height` 를 명시(레이아웃 예약).
4. LCP 후보(상품 상세 대표 이미지, 홈 히어로)는 `priority` 지정. 그 외는 지정 금지(대역 낭비).
5. `next.config.ts` 의 `images.formats` 는 `["image/avif", "image/webp"]`. 외부 도메인 이미지는 `images.remotePatterns` 에 명시적으로 등록.
6. 원본 용량 예산: 썸네일 ≤ 60KB, 상세 대표 ≤ 200KB (업로드/CMS 단계에서 관리, FE 는 포맷/사이즈 파라미터로 방어).
7. `alt` 는 필수. 장식용이면 `alt=""`.

---

## 5. 디자인 파트 협의 필요 (현재 보류)

아래는 구조에 영향을 주지만 디자인 파트와 합의 전까지 **확정하지 않는다.** 임의 구현 금지.

| 항목 | 쟁점 | 임시 방침 |
|---|---|---|
| 목록 페이징 방식 | 무한스크롤 vs 번호 페이지네이션 vs "더보기" 버튼 | 화면 목록 표엔 무한스크롤로 적었으나 **미확정**. 접근성(키보드/스크린리더)·SEO 영향 큼 |
| 상품 카드 정보 밀도 | 카드에 노출할 배지(품절/쿠폰/무료배송) 수 | 스키마엔 필드만 두고 표시 여부 보류 |
| 검색 UX | 자동완성/최근검색어/추천 | 라우트(`/search`)만 확정, 부가기능 보류 |
| 장바구니 위치 | 별도 페이지(`/cart`) vs 드로어(Drawer) vs 둘 다 | UI 스토어에 `isCartDrawerOpen` 뼈대만 존재, 확정 보류 |
| 게스트 장바구니 | 비로그인 장바구니 허용 여부 | 현재 `(account)` 로 분류(로그인 필수 가정), 재검토 대상 |

협의 완료 항목은 이 표에서 제거하고 §1·§2·§4 본문에 반영한다.
