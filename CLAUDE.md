# CLAUDE.md — 프로젝트 표준 인덱스

> `total-client` — Next.js 16 App Router 기반 통합 이커머스 프론트엔드.
> 이 파일은 **최상위 인덱스**다. 실제 규칙은 `.agents/**/SKILLS.md` 에 있다.
> (Next 16 이 이 파일을 자동 생성하지 못하도록 `next.config.ts` 에 `agentRules: false` 를 설정했다.)

---

## 문서 지도

| 문서 | 다루는 것 | 상태 |
|---|---|---|
| [.agents/api-convention/SKILLS.md](.agents/api-convention/SKILLS.md) | API 계층 아키텍처(Route Handler→types(Zod)→apiClient→hooks/&lt;domain&gt;→컴포넌트), publicFetch/privateFetch, 쿼리 키 팩토리, Zod 스키마 규칙, 공용 응답 포맷 `{ statusCode, message, data }`, Optimistic Update 정책, 새 엔드포인트 체크리스트 | ✅ 실제 문서 존재 (스코프1). 라우트·훅 구현 코드는 대기 |
| [.agents/structure-convention/SKILLS.md](.agents/structure-convention/SKILLS.md) | 라우트 그룹 `(auth)/(shop)`, 라우트 맵, **컴포넌트 계층(Atomic Design 하이브리드 3계층)**, MVP 화면 목록·렌더링 전략·책임 지표, 전체 폴더 트리, `next/image`+종횡비 고정 규칙, 디자인 협의 보류 항목 | ✅ 실제 문서 + 라우트/컴포넌트 폴더 스켈레톤 존재 (스코프1). 화면·컴포넌트 구현은 대기 |
| [.agents/code-style-convention/SKILLS.md](.agents/code-style-convention/SKILLS.md) | ⭐ **eslint/prettier 의 근거 문서.** 명명 규칙, CDD 순서, 상태관리 원칙(서버/클라 분리, Zustand 마운트당 생성, useShallow 강제), 폼 규칙, 이미지·접근성·애니메이션·번들 전략, **"eslint 규칙 매핑 예시" 표** | ✅ 실제 문서 존재 (스코프1). eslint/prettier 설정 파일은 스코프2 |
| [.agents/git-convention/SKILLS.md](.agents/git-convention/SKILLS.md) | (지금 적용) 브랜치 전략, Conventional Commits, PR 준비 체크리스트, 리뷰 포인트. **+ ⏳ 예정 작업 명세(스코프2)**: PR/Issue 템플릿, 브랜치 룰셋, husky, CI typecheck, Storybook 규약, eslint/prettier 강제 구성 | 📋 스코프1 규칙은 즉시 적용. 스코프2 7개 항목은 **문서 내 명세만 존재**, 실제 파일(`.github/`, `.husky/`, `.storybook/` 등)은 미생성 |
| [.agents/security-convention/SKILLS.md](.agents/security-convention/SKILLS.md) | 프론트엔드 시큐어 코딩 FE-01~FE-16, 각 항목의 "이 프로젝트 적용 지점"(없으면 ⏳), 릴리스 전 보안 체크리스트 | ✅ 실제 문서 존재 (스코프1). 상당수 적용 지점은 ⏳(해당 코드 미구현) |

**상태 범례**
- ✅ **실제 파일 존재 · 스코프1 완료** — 지금 이 저장소에 있고 바로 따른다.
- 📋 **문서 내 스코프2 명세 포함, 실제 구현은 대기** — 문서에는 상세 명세가 있으나, 그것을 강제하는 설정/도구 파일은 아직 만들지 않았다.

---

## 역할 분담 (스코프1 / 스코프2)

이 프로젝트의 초기 셋업은 두 스코프로 나뉜다.
**스코프(1) = 이 문서들과 폴더/라우트 스켈레톤이다.** 즉 `.agents/**/SKILLS.md` 5종, 이 `CLAUDE.md`, `src/**` 폴더 구조(Atomic Design `components/{atoms,molecules,organisms}/`, 도메인 `hooks/`, `types/`, `errors/` — 빈 폴더는 `.gitkeep`), `(auth)/(shop)` 라우트 그룹 + 페이지 스켈레톤 + `src/middleware.ts`, 그리고 환경·빌드 세팅(`package.json`·`.nvmrc`·`tsconfig`·`next.config.ts`·`postcss.config.mjs`·`globals.css`·`Dockerfile`·`.dockerignore`·`.env.example`·`src/lib/env.ts`·`k8s/*.example.yaml`)까지가 실제 산출물로 존재하고 검증(`npm run dev`/`build`, `docker build`/`run`)까지 끝났다.
**스코프(2) = 이 문서들에 적힌 명세를 실제로 구현하는 일이다.** 구체적으로 eslint/prettier 설정과 `eslint-config-prettier` 연동, husky 훅(pre-commit `lint-staged` + commit-msg Conventional Commits 정규식), GitHub Actions CI(`lint`→`format:check`→`typecheck`→`build`, Storybook 테스트 잡 분리), PR 템플릿, Issue 템플릿 2종(버그/기능), `main` 브랜치 룰셋(직접 push 금지·리뷰 1인·필수 상태 체크·squash), Storybook `/stories` 구조와 CDD 기반 스토리 규약을 만든다. 스코프(2) 담당자는 **자기 도구 버전에 맞춰** 파일을 만들되, 규칙의 "내용"은 위 문서(특히 `code-style-convention` §10 매핑 표와 `git-convention` 의 "⏳ 예정 작업 명세")를 벗어나지 않는다. 스코프(1) 실행 중에는 스코프(2)에 해당하는 실제 파일·폴더(`.eslintrc`, `.prettierrc`, `.husky/`, `.github/`, `.storybook/`)를 **선점 생성하지 않았다.**

---

## 지금 당장 적용되는 규칙 10개

`.agents/**` 에서 발췌한, **오늘부터 지켜야 하는** 규칙.

1. **RSC 가 기본.** `"use client"` 는 상호작용/브라우저 API 가 필요한 잎 컴포넌트에만. 트리 상단(layout/page)에 올리지 않는다. 화면별 렌더링 전략(SSG/ISR/SSR/CSR)은 상황에 맞게 — structure §2-1 / code-style §8
2. **컴포넌트는 Atomic Design 3계층.** `components/{atoms,molecules,organisms}/`, molecule·organism 은 도메인 폴더로 분류. templates/pages 는 `layout.tsx`/`page.tsx` 가 대신한다. — structure §3 / code-style §2-1
3. **서버 상태 = TanStack Query, 클라 UI 상태 = Zustand. 절대 섞지 않는다.** 서버 응답을 Zustand 에 복사 금지. — code-style §3-1
4. **Zustand 는 모듈 최상단 `create()` 싱글턴 금지.** `zustand/vanilla` 의 `createStore` 팩토리 + Provider 가 `useRef` 로 마운트당 1회 생성. 배열/객체 selector 는 `useShallow` 강제. — code-style §3-2·3-3
5. **모든 Provider 는 `src/app/providers.tsx` 에서만 합성.** `layout.tsx` 는 `<Providers>` 만 감싼다. — api-convention §2
6. **데이터 흐름은 단방향.** Route Handler → `types/`(Zod) → `lib/apiClient` → `hooks/<domain>/` → 컴포넌트. 컴포넌트/organism 은 `fetch` 직접 호출 금지, 쿼리 키는 `hooks/<domain>/queryKeys.ts` 팩토리에서만. — api-convention §1·§4
7. **서버/외부 응답은 Zod `parse` 후 사용.** 스키마는 `src/types/<domain>.ts`, 이름은 `PascalCase`+`Schema`. — api-convention §5 / security FE-07
8. **`<img>` 금지 → `next/image` + 종횡비 CSS 선고정.** LCP 후보만 `priority`. (경쟁사 실측: PNG 2.4MB, LCP 20s, CLS 0.77) — structure §5 / code-style §6
9. **접근성:** 아이콘 버튼 `aria-label` 필수, 링크는 목적지 서술, `user-scalable` 제한 금지, 본문 대비 ≥ 4.5:1. (경쟁사 접근성 82점 → 목표 95+) — code-style §5
10. **커밋은 Conventional Commits, 브랜치는 `feat/…` `fix/…` 등 목적 단일.** `NEXT_PUBLIC_` 에 서버 비밀 금지(빌드 타임 번들 인라인). 인가는 서버에서(`middleware.ts` 는 UX용). — git-convention §1~2 / security FE-10·FE-15

Optimistic Update 는 **기본적으로 하지 않는다**(성공 후 `invalidateQueries`). 유일한 예외는 장바구니 수량 증감이며, 그 경우에도 PR 에서 3가지 근거에 답해야 한다. — api-convention §7

---

## 환경 · 실행

| 항목 | 값 |
|---|---|
| Node | 24.19.0 (`.nvmrc`) · npm 11.17.0 (`packageManager`) |
| 프레임워크 | Next.js 16.3.3 (App Router, Turbopack 기본) |
| React | 19.2.8 |
| TypeScript | 6.0.3 (7.x 아님 — typescript-eslint ERESOLVE 회피) |
| 스타일 | Tailwind CSS v4.1 (CSS-first, `@theme`). `tailwind.config.js` 없음 |
| 서버 상태 | TanStack Query 5 / 클라 상태 Zustand 5 |
| 폼 | React Hook Form 7 + Zod 4 + `@hookform/resolvers` |
| PWA | `@serwist/turbopack` (Route Handler 방식) |
| 배포 | `output: "standalone"` + 3-stage Dockerfile (Node 24.19.0-slim) + `k8s/*.example.yaml` |

```bash
nvm use                 # .nvmrc → Node 24.19.0
npm install
cp .env.example .env.local
npm run dev              # http://localhost:3000
npm run build            # .next/standalone 생성
npm run typecheck        # tsc (app + service worker)

# Docker
docker build --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
             --build-arg NEXT_PUBLIC_APP_ENV=production -t total-client:local .
docker run -p 3000:3000 -e API_INTERNAL_URL=http://api.internal total-client:local
```

`/api/health` (k8s probe 경로)와 도메인 라우트/컴포넌트는 다음 단계에서 구현한다.
