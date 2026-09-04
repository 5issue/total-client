# 코드 스타일 컨벤션 (code-style-convention)

> ⭐ **이 문서는 eslint / prettier 같은 자동 강제 도구가 검증해야 할 규칙의 근거(source of truth)다.**
> 실제 `.eslintrc` / `.prettierrc` 설정과 CI 연동은 다른 담당자(스코프 2) 몫이지만, 그 설정이
> 강제하는 **"내용"은 전부 이 문서를 따라야 한다.** 이 문서와 상충하는 규칙을 임의로 추가하지 않는다.
> 규칙을 바꾸려면 먼저 이 문서를 고치고, 그다음 도구 설정을 맞춘다. (문서 → 설정, 역방향 금지)

이 문서는 스코프(1) 산출물이다. 현재 저장소에는 이 규칙을 강제하는 설정 파일이 없다.
문서 맨 끝 "eslint 규칙 매핑 예시" 표가 스코프(2) 담당자에게 "무엇을 강제해야 하는가"를 알려준다.

---

## 1. 명명 규칙

| 대상                     | 규칙                                 | 예                                                    |
| ------------------------ | ------------------------------------ | ----------------------------------------------------- |
| 컴포넌트 파일            | `PascalCase.tsx`                     | `ProductThumbnail.tsx`, `QueryProvider.tsx`           |
| 훅 파일                  | `useCamelCase.ts`                    | `useUIStore.ts`, `useProducts.ts`                     |
| 그 외 모듈 파일          | `camelCase.ts`                       | `queryClient.ts`, `apiClient.ts`                      |
| 타입/스키마 파일         | 도메인명 소문자                      | `types/product.ts`, `types/common.ts`                 |
| 에러 클래스 파일         | `PascalCase.ts` (클래스명과 동일)    | `errors/ApiError.ts`                                  |
| 라우트 파일              | Next 예약어 그대로                   | `page.tsx`, `layout.tsx`, `route.ts`, `middleware.ts` |
| 컴포넌트/타입/인터페이스 | `PascalCase`                         | `ProductThumbnail`, `type CartItem`                   |
| 변수/함수                | `camelCase`                          | `getQueryClient`, `isSoldOut`                         |
| 상수(불변 리터럴)        | `UPPER_SNAKE_CASE`                   | `OAUTH_PROVIDERS`, `BOTTOM_NAV`                       |
| 불리언                   | `is/has/should/can` 접두             | `isLoading`, `hasNextPage`                            |
| 이벤트 핸들러            | `handle` 접두, prop 은 `on` 접두     | `handleSubmit`, `<X onSubmit={...} />`                |
| Zod 스키마               | `PascalCase` + `Schema` 접미         | `ProductSchema`                                       |
| 쿼리 키 팩토리           | `<domain>Keys` (파일 `queryKeys.ts`) | `productKeys`, `cartKeys`                             |
| Zustand 팩토리           | `create<Name>Store`                  | `createUIStore`                                       |

- 약어는 한 단어로 취급: `apiUrl`, `ProductId` (O) / `aPIUrl`, `ProductID` (X).
- 디렉터리는 `kebab-case` 또는 단순 소문자. 도메인 폴더는 단수(`hooks/order/`, `components/molecules/cart/`).
- default export 는 라우트 파일(`page.tsx` 등)과 Next 규약 파일에만. 그 외는 named export.

---

## 2. CDD(Component Driven Development) + Atomic Design

### 2-1. 컴포넌트 계층 (Atomic Design 하이브리드 — 3계층)

원래 5단계지만 templates/pages 는 App Router 의 `layout.tsx`/`page.tsx` 가 대신하므로
`src/components/` 는 **3계층**만 둔다. (structure-convention §3 원본)

| 계층      | 폴더                                                                       | 정의                                                                | fetch                     |
| --------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------- |
| atoms     | `components/atoms/`                                                        | 최소 UI, 도메인 지식 없음 (Button, Input, Badge, Spinner)           | 금지                      |
| molecules | `components/molecules/{shared,product,cart,auth}/`                         | atom 조합, 도메인별 분류 (PriceTag, ProductThumbnail, CartLineItem) | 금지                      |
| organisms | `components/organisms/{shared,home,product,cart,checkout,mypage,ai,auth}/` | 화면의 한 구획 (Header, ProductGrid, CartList)                      | 금지 — 훅을 주입받아 조립 |

- 2개 이상 도메인이 공유하면 `shared/`, 아니면 도메인 폴더.
- molecule 이 다른 molecule 을 쓰면 organism 후보.
- 데이터 fetch 는 라우트(`page.tsx`)나 organism 컨테이너에서 `hooks/<domain>` 훅으로만.

### 2-2. 작성 순서

컴포넌트는 아래 순서로 만든다. 순서를 지키면 스토리/테스트/문서가 자연히 따라온다.
(Storybook `/stories` 규약은 git-convention 의 스코프(2) 명세 참고 — 지금은 폴더를 만들지 않는다.)

> **스펙 출처 (structure §6-1)**: 상태값 목록·인터랙션 조건은 디자인팀 핸드오프 기준.
> 수치·간격·컬러·radius 등 구체 스펙은 **FE 가 Figma 에서 직접 확정**한다(MCP `get_design_context` / `get_variable_defs`, 값 1:1).
> 디자인팀 스펙 문서를 기다리지 말 것. 상태 커버리지(step 4)를 수치보다 먼저 챙긴다.
>
> **상태 목록은 컴포넌트마다 다르다** — 핸드오프에 있는 상태만 다룬다. 설계상 없는 상태(Calendar 의 loading 등)를 위해 분기·스토리·prop 을 만들지 않는다. (structure §6-1 "⭐ 상태 커버리지" 참고)

1. **계층 결정.** atom / molecule / organism 중 무엇인지, 어느 도메인 폴더인지 먼저 정한다.
2. **Props 인터페이스.** 무엇을 받는지 타입으로 확정. 필수/선택 구분.
3. **표현(presentational) 컴포넌트 구현.** 데이터 fetch 없음. props 로만 렌더. `"use client"` 는 상호작용이 있을 때만.
4. **상태별 분기 정리.** 디자인팀이 그 컴포넌트에 대해 넘긴 상태값 목록(structure §6-1)에 있는 상태만 분기한다. `default` 는 항상, `loading`/`empty`/`error`/`disabled`/스켈레톤 등은 **그 목록에 있을 때만**. 목록에 없는 상태는 만들지 않는다.
5. **(스코프 2) 스토리 작성.** step 4 에서 정리한 상태마다 스토리 1개 + 상호작용은 `play` 함수 인터랙션 테스트. 파일은 컴포넌트 옆에 co-location(`ProductThumbnail.stories.tsx`).
6. **컨테이너/훅 연결.** `hooks/<domain>/` 의 query hook 을 붙인 wrapper(organism 컨테이너 또는 `page.tsx`)를 별도로.
7. **접근성 점검.** §5 체크리스트 통과.
8. **문서화.** 복잡한 props 는 JSDoc.

원칙: **표현과 데이터는 분리한다.** `ProductGrid` 는 `products` 를 받고, `page.tsx`/컨테이너가 `useProducts()` 로 데이터를 공급한다.

---

## 3. 상태 관리 원칙

### 3-1. 서버 상태 / 클라이언트 상태 분리

| 종류                                      | 도구                    | 저장 위치               | 예                                                |
| ----------------------------------------- | ----------------------- | ----------------------- | ------------------------------------------------- |
| 서버 상태 (원격 데이터, 캐시 대상)        | **TanStack Query**      | Query 캐시              | 상품 목록, 장바구니 내용, 주문 내역, 프로필       |
| 클라이언트 UI 상태 (세션 한정, 원격 아님) | **Zustand**             | 마운트당 store 인스턴스 | 모바일 GNB 열림, 카트 드로어 열림, 필터 임시 선택 |
| 폼 로컬 상태                              | **React Hook Form**     | 폼 인스턴스             | 입력값, 검증 에러, dirty                          |
| URL 상태 (공유·북마크 대상)               | `searchParams` / 라우터 | URL                     | 검색어, 페이지 커서, 정렬                         |

**절대 금지:** 서버 응답(예: 상품 목록)을 Zustand 에 복사해 두는 것. 캐시 무효화·동기화가 깨진다.

### 3-2. Zustand: 모듈 싱글턴 금지, 마운트당 생성

```ts
// ❌ 금지 — 모듈 최상단 create() 싱글턴 (SSR 요청 간 상태 공유됨)
export const useUIStore = create<UIStore>()((set) => ({ ... }));
```

```ts
// ✅ zustand/vanilla 의 createStore 로 "팩토리"만 정의 (src/stores/uiStore.ts)
export const createUIStore = (initState = defaultUIState) =>
  createStore<UIStore>()((set) => ({ ...initState /* actions */ }));
```

```tsx
// ✅ Provider 가 useState 지연 초기화로 마운트당 1회 생성 (src/providers/UIStoreProvider.tsx)
// useRef 가 아닌 이유: ref.current 를 렌더 중 읽는 것은 금지(eslint react-hooks/refs)되어 있고,
// 이 store 는 Provider value 로 렌더에 바로 쓰이므로 useState 지연 초기화가 안전하다.
export function UIStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState<UIStoreApi>(() => createUIStore());
  return <UIStoreContext.Provider value={store}>{children}</UIStoreContext.Provider>;
}
```

### 3-3. useShallow 강제

배열/객체를 반환하는 selector 는 **반드시 `useShallow` 로 감싼다.** 참조만 바뀐 리렌더를 막기 위함.
프로젝트는 이를 강제하는 전용 훅을 제공한다(`src/hooks/useUIStore.ts`):

```ts
// 단일 원시값 — 그냥
export function useUIStore<T>(selector: (s: UIStore) => T): T { ... }

// 배열/객체 반환 — useShallow 강제 래핑
export function useUIStoreShallow<T>(selector: (s: UIStore) => T): T {
  return useStore(useUIStoreApi(), useShallow(selector));
}
```

```tsx
// ❌ 객체 리턴인데 useShallow 없음 → 매 렌더 리렌더
const { open, close } = useUIStore((s) => ({ open: s.openMobileNav, close: s.closeMobileNav }));

// ✅
const { open, close } = useUIStoreShallow((s) => ({
  open: s.openMobileNav,
  close: s.closeMobileNav,
}));
```

### 3-4. Provider 합성

모든 Provider 는 `src/app/providers.tsx` 에서만 합성. `layout.tsx` 는 `<Providers>` 만 감싼다.
순서: 서버 상태(Query) → 클라 UI(Zustand) → 표현(테마/토스트).

---

## 4. 폼 작성 규칙

- **React Hook Form v7 + Zod v4 + `@hookform/resolvers`** 조합만 사용한다. 수동 `useState` 폼 금지.
- 스키마는 `src/types/<domain>.ts` 에. 폼 컴포넌트 안에 인라인 정의 금지.
- `zodResolver(Schema)` 로 검증을 연결하고, 폼 타입은 `z.infer<typeof Schema>` 로 파생한다.
- 제출 핸들러는 `handleSubmit(onValid)` 형태. `onValid` 안에서 mutation 호출.
- 서버 에러(422 등)는 `setError` 로 필드에 매핑하거나 폼 상단 요약으로 표시.
- 접근성: 모든 입력에 `<label htmlFor>` 연결, 에러는 `aria-describedby` + `role="alert"`.
- 제출 버튼은 `isSubmitting` 중 `disabled` + 로딩 표시. 중복 제출 방지.

```tsx
const LoginSchema = z.object({
  email: z.string().email('이메일 형식이 올바르지 않습니다'),
  password: z.string().min(8, '8자 이상 입력하세요'),
});
type LoginInput = z.infer<typeof LoginSchema>;

const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) });
```

---

## 5. 접근성 규칙

> **근거: 경쟁사(마켓컬리) 접근성 감사 실측 82점.** 아래는 그 감사에서 감점된 항목을 예방하는 규칙이다.

| 규칙                                 | 상세                                                                                                        |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| 아이콘 전용 버튼은 `aria-label` 필수 | 텍스트 없는 버튼(장바구니, 검색, 닫기, 좋아요)에 목적을 서술. `<button aria-label="장바구니 열기">`         |
| 링크는 목적지를 설명                 | "여기", "더보기" 단독 금지. `aria-label` 이나 시각적으로 숨긴 텍스트로 "상품 상세 보기: {상품명}"           |
| 확대(zoom) 제한 금지                 | `viewport` 에 `user-scalable=no`, `maximum-scale=1` **사용 금지**. `initialScale=1` 만.                     |
| 색 대비                              | 본문 텍스트 대비 ≥ 4.5:1, 큰 텍스트/UI 요소 ≥ 3:1. `--color-brand-500` 등 브랜드색·상태색을 배경 대비 확인. |
| 색만으로 정보 전달 금지              | 품절/할인/에러를 색으로만 표시하지 않는다. 아이콘/텍스트 병행.                                              |
| 포커스 가시성                        | `:focus-visible` 링을 지우지 않는다. 커스텀 시 대비 확보.                                                   |
| 이미지 `alt`                         | 의미 있으면 서술, 장식이면 `alt=""`. §6 참고.                                                               |
| 폼 라벨                              | `<label htmlFor>` 연결. placeholder 를 라벨 대용으로 쓰지 않는다.                                           |
| 랜드마크/제목                        | 페이지당 `<h1>` 하나. heading 레벨 건너뛰지 않기. `<main>`, `<nav>`, `<header>`, `<footer>` 사용.           |
| 상호작용 요소 크기                   | 터치 타깃 최소 44×44px.                                                                                     |
| 동적 영역 알림                       | 토스트/검증 결과는 `role="status"` 또는 `role="alert"`.                                                     |
| 키보드 조작                          | 모든 상호작용은 키보드로 가능. 커스텀 드롭다운/모달은 포커스 트랩 + `Esc` 닫기.                             |

목표: Lighthouse 접근성 **95점 이상** (경쟁사 82점 대비).

---

## 6. 이미지 규칙

> 근거: 경쟁사 실측 — 메인 이미지 PNG **2.4MB**, LCP 약 **20초**, CLS **0.77**. (structure-convention §5 와 동일 근거)

- `<img>` 직접 사용 **금지** → `next/image` 만 사용. (`@next/next/no-img-element` 로 강제)
- 이미지 컨테이너는 **종횡비를 CSS 로 먼저 고정**(`aspect-*` + `relative` + `fill`), 로드 전에도 높이 확정.
- 대괄호 임의값(`rounded-[--radius-m]`)이 아니라 생성된 정식 유틸리티(`rounded-m`) 사용.
- LCP 후보(상세 대표 이미지, 홈 히어로)만 `priority`. 그 외 지정 금지.
- `sizes` 를 실제 레이아웃에 맞게 지정. 외부 도메인은 `next.config.ts` `images.remotePatterns` 에 등록.
- 포맷: `images.formats = ["image/avif", "image/webp"]`.

---

## 6-1. 디자인 토큰 (Tailwind v4)

`tailwind.config.js` 없음 (v4 CSS-first). 토큰은 관심사별로 분리하고 `globals.css` 가 합친다:

| 파일                               | 내용                                                                                                      | Figma 출처                                                         |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `src/styles/tokens/color.css`      | 팔레트 · 시맨틱 색 · shadow · `:root` 라이트 값                                                           | node 2002-13 "Color System" (일부는 실제 컴포넌트 노드, 아래 참고) |
| `src/styles/tokens/typography.css` | 폰트 패밀리 · 타입 스케일                                                                                 | node 2054-1038 "텍스트 스타일 목록"                                |
| `src/styles/globals.css`           | `@import "tailwindcss"` + 위 두 파일 `@import` + `@custom-variant dark` + `--radius-*` + 기본 요소 스타일 |

모든 값은 **5팀 디자인 시스템(Figma)** 변수에서 그대로 추출한다. 임의값 금지. 새 토큰도 Figma 확정 후에만 추가.

> ⚠️ node 2002-13 "Color System" 은 색상 **스와치 전시 보드**일 뿐 완전한 스펙이 아니다(radius 섹션 자체가 없음). 그 보드의 스와치 카드 장식용 모서리(20px)를 radius 토큰으로 잘못 추출한 적이 있다(`--radius-m` 초기값 20px, 실제 컴포넌트는 8px) — **토큰 추출은 반드시 실제 컴포넌트 노드의 변수 바인딩(`get_variable_defs`)으로 검증**하고, 전시 보드 값만으로 확정하지 않는다.

### 계층

| 계층        | 정의 위치                                                                              | 예                                                                                         | 생성 유틸리티                                                      |
| ----------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| 프리미티브  | `@theme { }`                                                                           | `--color-neutral-500`, `--color-brand-500`, `--radius-{s,m,l,xl}`(4/8/12/16), `--shadow-m` | `bg-neutral-500`, `bg-brand-500`, `rounded-{s,m,l,xl}`, `shadow-m` |
| 타입 스케일 | `@theme { }` (`--text-*` + `--text-*--line-height`/`--letter-spacing`/`--font-weight`) | `--text-body-m`                                                                            | `text-body-m` (size+lh+ls+weight 한 번에)                          |
| 시맨틱      | `@theme inline { }` → `:root` 캐스케이드                                               | `--color-fg`, `--color-surface`, `--color-border`, `--color-primary`                       | `text-fg`, `bg-surface`, `border-border`, `bg-primary`             |

### 컬러 (Figma → 토큰)

| Figma                                                       | 토큰                                                                                   | 비고                                                                                                     |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Natural 100~950                                             | `--color-neutral-*`                                                                    | 블루 그레이                                                                                              |
| Brand 50~950                                                | `--color-brand-*`                                                                      | 퍼플. 500 = Primary                                                                                      |
| Normal/White·Black                                          | `--color-white` `--color-black`                                                        | **Black = `#222222`** (순수 #000 아님)                                                                   |
| Text/primary·Secondary·Tertiary·Quaternary·disabled·Inverse | `--color-fg` `--color-fg-secondary` … `--color-fg-inverse`                             | Neutral/Black 프리미티브에 매핑                                                                          |
| Text/Danger                                                 | `--color-fg-danger`                                                                    | `#d24b3a` — 에러 텍스트. 2002-13 에 없음, Input 컴포넌트 노드에서 추출                                   |
| Surface/base·Secondary·Overlay_gray·Overlay_blue            | `--color-surface` `--color-surface-secondary` `--color-overlay` `--color-overlay-blue` | Overlay 는 alpha 포함                                                                                    |
| Border/200                                                  | `--color-border`                                                                       |                                                                                                          |
| Border/active                                               | `--color-border-active`                                                                | `#222222` — 포커스 상태. 2002-13 에 없음, Input 컴포넌트 노드에서 추출                                   |
| Secondary/orange·cyan·Banner                                | `--color-orange` `--color-cyan` `--color-banner`                                       |                                                                                                          |
| Secondary/Brand-Naver·Kakao·Apple                           | `--color-naver` `--color-kakao` `--color-apple`                                        | 소셜 로그인 버튼                                                                                         |
| Semantic/success·warning·error·info                         | `--color-success` … `--color-info`                                                     | **4색 모두 흰 배경 텍스트 대비 4.5:1 미달 → 배경·뱃지 fill 톤.** 상태 텍스트용 강조색은 디자인 확인 필요 |

### 타이포 (Figma "텍스트 스타일 목록")

- Pretendard: `text-display-{l,m,s,xs}`, `text-heading-{0..6}`, `text-body-{l,m,s}`, `text-label-{xl,l,m,s,xs}`, `text-caption-{xl,l,m,s}`
- SF Pro 숫자: `text-numeric-{xxl,xl,l,m,s}` — **`font-numeric` 클래스를 함께** 적용 (`font-numeric text-numeric-l`)
- letter-spacing 은 Figma % → `em` 변환 (-2% → -0.02em)
- 폰트 파일 로딩(`next/font` 등)은 이 토큰과 별개, 다음 단계

### 규칙

- **컴포넌트는 시맨틱/스케일 유틸리티만**: `text-fg`, `bg-surface`, `border-border`, `text-body-m`, `rounded-m`. 하드코딩 색(`text-zinc-500`, `bg-white`, `text-[#690085]`) 금지.
- 프리미티브(`bg-brand-300` 등)는 시맨틱 토큰으로 표현 불가할 때만. 새 시맨틱이 필요하면 토큰을 먼저 추가(디자인 파트 협의).
- 대괄호 임의값(`text-[15px]`, `rounded-[--radius-m]`) 금지 — 생성된 정식 유틸리티만.

### 다크 모드

- 이 디자인 시스템에는 **다크 팔레트가 없다**(라이트 전용). 지금은 라이트 값만 정의.
- 시맨틱 색은 `tokens/color.css` 의 `@theme inline` + `:root` 캐스케이드 구조라, 다크 팔레트가 확정되면 같은 파일에 `:root[data-theme="dark"]` 블록만 추가하면 된다. `@custom-variant dark` 는 `globals.css` 에 이미 선언돼 있음.
- 그때 라이트/다크 **양쪽 모두** 본문 대비 4.5:1 이상 확인 (§5).

### Figma → 코드 반영 절차

디자이너가 Figma 토큰을 수정하면:

1. **재추출** — MCP `get_variable_defs` 로 해당 노드(색 `2002-13` / 타이포 `2054-1038`)를 다시 읽는다. `get_screenshot` 으로 값 대조.
2. **반영** — `tokens/color.css` · `typography.css` 수정. Figma 값 1:1, 임의값 금지, "Figma → 토큰" 매핑 주석 유지, 프리미티브 / `@theme inline` / `:root` 계층 배치 유지.
3. **대비 확인** — 본문 대비 ≥ 4.5:1 (§5). 미달 색은 배경·뱃지 fill 로만, 텍스트 강조색은 디자인 재확인. 판단 결과를 토큰 파일 주석에 남긴다.
4. **PR** — `refactor/tokens-*` 또는 `chore/tokens-*` 브랜치 → 저장소 템플릿 PR → 리뷰어 1인 → squash. CodeRabbit 이 `styles/**/*.css` 규칙으로 자동 점검한다.

빌드 도구(Style Dictionary 등)·플러그인(Tokens Studio)·npm 패키지·전용 CI 는 **도입하지 않는다.** 소스 오브 트루스는 위 CSS 파일이다. 판단 근거·재검토 트리거는 팀 노션 「디자인 토큰 파이프라인 — 현행 결정 (v1)」.

---

## 7. 애니메이션

- **CSS 우선.** 트랜지션/키프레임/`@starting-style`/`transition-behavior` 로 해결되면 JS 애니메이션 라이브러리를 넣지 않는다.
- GPU 친화 속성(`transform`, `opacity`)만 애니메이트. `width`/`height`/`top`/`left` 애니메이트 금지(레이아웃 스래싱).
- `prefers-reduced-motion: reduce` 를 존중한다. 큰 모션은 이 미디어쿼리에서 축소/제거.
- JS 애니메이션이 정말 필요하면(제스처 기반 드래그 등) PR 에서 근거를 밝히고 도입.
- 애니메이션은 정보 전달을 보조할 뿐, 콘텐츠 접근을 막지 않는다(스캔/자동 스크롤 금지).

---

## 8. 번들 · 렌더링 전략

- **화면별 렌더링 전략(SSG / ISR / SSR / CSR)은 `structure-convention` §2-1 에서 고른다.** 이 절은 컴포넌트/번들 레벨 규칙만.
- **RSC(서버 컴포넌트)가 기본.** `"use client"` 는 상호작용/브라우저 API/`useState`·`useEffect`/컨텍스트 소비가 필요한 **잎 컴포넌트**에만 선언한다.
- `"use client"` 를 트리 상단(레이아웃/페이지)에 올리지 않는다. 클라 경계는 최대한 아래로. (페이지가 CSR 이어도 서버 껍데기 + 클라 잎 구조 유지)
- 동적 API(`cookies()`/`headers()`/`searchParams`)는 그것을 실제로 쓰는 세그먼트에서만 호출 — 상위에서 부르면 하위 전체가 SSR 로 강등된다.
- 무거운 클라 전용 위젯(차트, 에디터, 지도)은 `next/dynamic` 으로 분할 로드.
- 배럴 파일(`index.ts` 재-export 모음) 지양 — 트리셰이킹·번들 분석을 방해한다. 필요한 것만 직접 import.
- 서드파티 추가 전 번들 영향 확인. "작은 유틸 하나" 때문에 큰 패키지를 넣지 않는다.
- 날짜/숫자 포맷은 `Intl` API 우선(런타임 내장).
- 폰트는 `next/font` 로 self-host, CLS 방지(`display: swap` + `size-adjust`).

---

## 9. 일반 문법 규칙 (prettier/eslint 가 강제할 대상)

| 규칙             | 값                                                                      |
| ---------------- | ----------------------------------------------------------------------- |
| 들여쓰기         | 스페이스 2칸                                                            |
| 세미콜론         | 사용                                                                    |
| 따옴표           | 큰따옴표(`"`), JSX 속성도 큰따옴표                                      |
| 줄 길이          | 100자 권장(하드 래핑은 prettier 에 위임)                                |
| 후행 쉼표        | `all`                                                                   |
| import 순서      | 외부 → 내부(`@/`) → 상대경로, 그룹 간 빈 줄                             |
| 타입 전용 import | `import type { X }` 사용                                                |
| `any`            | 금지(불가피하면 `unknown` + 좁히기, 또는 `// eslint-disable` 사유 주석) |
| 미사용 변수      | 금지(`_` prefix 는 허용)                                                |
| `console`        | `console.warn`/`console.error` 만. `console.log` 는 커밋 금지           |
| `React` import   | 불필요(automatic runtime). `import { useState } from "react"` 형태      |
| 파일 끝          | 개행 1개                                                                |

---

## 10. eslint 규칙 매핑 예시 (스코프 2 담당자용 명세)

> 이 표는 **"무엇을 강제해야 하는가"** 를 알려주는 명세다. **실제 eslint 설정 파일이 아니다.**
> 스코프(2) 담당자는 이 표를 기준으로 `.eslintrc` / flat config 를 구성한다. 패키지 버전은 그때 최신으로 선택한다.

| 이 문서의 규칙                                    | 강제 수단(eslint 규칙 예시)                                     | 비고                                                                                                    |
| ------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `<img>` 금지, `next/image` 강제 (§6)              | `@next/next/no-img-element`                                     | eslint-config-next 포함                                                                                 |
| RSC 기본 / `"use client"` 오용 (§8)               | `eslint-plugin-react-server-components` 또는 커스텀 규칙        | 자동화 어려움 — **리뷰로 보완**                                                                         |
| 서버/클라 상태 분리 (§3-1)                        | 자동 규칙 없음                                                  | **커스텀 규칙 필요 또는 리뷰로 대체**                                                                   |
| 서버 응답을 Zustand 에 저장 금지 (§3-1)           | 자동 규칙 없음                                                  | **리뷰 체크포인트** (git-convention 참고)                                                               |
| Zustand 모듈 싱글턴 금지 (§3-2)                   | `no-restricted-syntax` 로 최상위 `create(` 호출 패턴 경고       | 근사치 — 리뷰 병행                                                                                      |
| useShallow 누락 (§3-3)                            | `no-restricted-syntax` / 커스텀: 객체 리터럴 반환 selector 감지 | 어려움 — 전용 훅 사용을 리뷰로 강제                                                                     |
| 접근성 전반 (§5)                                  | `eslint-plugin-jsx-a11y` (recommended 이상)                     | `label-has-associated-control`, `no-autofocus`, `anchor-has-content`, `control-has-associated-label` 등 |
| 아이콘 버튼 `aria-label` (§5)                     | `jsx-a11y/control-has-associated-label`                         |                                                                                                         |
| 링크 목적지 설명 (§5)                             | `jsx-a11y/anchor-has-content`, `jsx-a11y/anchor-is-valid`       | "여기/더보기" 문구는 리뷰로                                                                             |
| `user-scalable` 금지 (§5)                         | `no-restricted-syntax` 로 viewport 메타/`viewport` export 검사  | 근사치 — 리뷰 병행                                                                                      |
| 색 대비 (§5)                                      | 자동 규칙 없음                                                  | 디자인 토큰 대비 검증 + Lighthouse CI                                                                   |
| 폼: RHF+Zod 강제 (§4)                             | 자동 규칙 없음                                                  | `no-restricted-imports` 로 다른 폼 라이브러리 차단 + 리뷰                                               |
| 타입 전용 import (§9)                             | `@typescript-eslint/consistent-type-imports`                    |                                                                                                         |
| `any` 금지 (§9)                                   | `@typescript-eslint/no-explicit-any`, `no-unsafe-*`             |                                                                                                         |
| 미사용 변수 (§9)                                  | `@typescript-eslint/no-unused-vars` (`argsIgnorePattern: "^_"`) |                                                                                                         |
| `console.log` 금지 (§9)                           | `no-console` (`allow: ["warn", "error"]`)                       |                                                                                                         |
| import 순서 (§9)                                  | `import/order` 또는 `perfectionist/sort-imports`                | prettier 와 충돌 없게                                                                                   |
| 배럴 파일 지양 (§8)                               | `no-restricted-imports` 패턴 / 커스텀                           | 리뷰 병행                                                                                               |
| 포맷 전반(들여쓰기/따옴표/세미콜론/후행쉼표) (§9) | **prettier** 전담                                               | eslint 는 포맷 규칙 끄기(`eslint-config-prettier`)                                                      |

**역할 분담(스코프 2 가 구현):**

- **prettier = 포맷 전담** (들여쓰기, 따옴표, 줄바꿈, 후행 쉼표).
- **eslint = 품질 전담** (미사용 코드, 접근성, 위험 패턴, import 규칙).
- 두 도구가 겹치는 포맷 규칙은 `eslint-config-prettier` 로 eslint 쪽을 끈다.
- 자동화가 불가능한 규칙(서버/클라 분리, useShallow, 색 대비)은 **PR 리뷰 체크리스트**(git-convention)로 보완한다.
