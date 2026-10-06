# 5issue-client

**신선식품 커머스 모바일 웹 — Next.js 16 App Router 프론트엔드**

## 소개

> Spring 백엔드와 AI 서빙을 BFF로 연결한 설치형 모바일 커머스 프론트엔드 저장소입니다.  
> 카카오·네이버 로그인으로 입장해 상품을 탐색하고, 장바구니·결제·주문·마이페이지까지 한 흐름으로 이어갑니다.

## 이 서비스는

사용자의 장보기 흐름을 홈에서 결제·주문 조회까지 한 앱 안에서 끝내는 모바일 우선 PWA입니다.

- **카카오·네이버 소셜 로그인**으로 시작
- **홈 · 검색 · 상품 · 장바구니 · 주문서 · 마이페이지**로 쇼핑 흐름을 구성
- **주문, 배송지, 취소·반품·교환, My냉장고·레시피**를 마이페이지에서 이어서 관리
- **토스페이먼츠**로 결제수단 선택부터 승인까지 연결
- **PWA**로 앱에 가까운 실행과 기본 오프라인 셸을 제공

## 팀

| <a href="https://github.com/dew2314"><img src="https://avatars.githubusercontent.com/u/145005522?v=4" width="120" alt="dew2314" /></a> | <a href="https://github.com/seongmin36"><img src="https://avatars.githubusercontent.com/u/202721995?v=4" width="120" alt="seongmin36" /></a> |
| -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [dew2314](https://github.com/dew2314)                                                                                                  | [seongmin36](https://github.com/seongmin36)                                                                                                  |

## 기술 스택

| **분류**      | **기술**                                                                                                                                                                                                                                                                                                                           | **선정 이유**                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Framework     | <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white">                                                                                                                                                                                                                           | App Router에서 화면, RSC, Route Handler(BFF)를 한 프레임워크로 관리           |
| Library       | <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=React&logoColor=white">                                                                                                                                                                                                                               | 컴포넌트 단위로 홈·상품·장바구니·결제 UI를 조합                               |
| Language      | <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">                                                                                                                                                                                                                     | API 응답·폼·상태를 컴파일 타임에 고정                                         |
| Styling       | <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white">                                                                                                                                                                                                                  | Tailwind v4 CSS-first. 디자인 토큰은 `src/styles/tokens`가 소스               |
| State         | <img src="https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white"> <img src="https://img.shields.io/badge/Zustand-433E38?style=for-the-badge">                                                                                                                                     | 서버 상태는 Query, 화면 UI 상태만 Zustand. 서버 응답을 스토어에 복사하지 않음 |
| Validation    | <img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white">                                                                                                                                                                                                                                   | 외부 응답과 폼을 같은 스키마로 검증                                           |
| Form          | <img src="https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white">                                                                                                                                                                                                             | 회원가입·배송지·주문서 입력                                                   |
| Auth          | <img src="https://img.shields.io/badge/Kakao-FFCD00?style=for-the-badge&logo=kakaotalk&logoColor=000000"> <img src="https://img.shields.io/badge/Naver-03C75A?style=for-the-badge&logo=naver&logoColor=white">                                                                                                                     | OAuth는 BFF가 처리. Access Token은 메모리, Refresh Token은 HttpOnly 쿠키      |
| Payment       | <img src="https://img.shields.io/badge/Toss_Payments-0064FF?style=for-the-badge">                                                                                                                                                                                                                                                  | API 개별 연동 키로 자체 결제수단 UI 유지                                      |
| PWA           | <img src="https://img.shields.io/badge/Serwist-5A0FC8?style=for-the-badge">                                                                                                                                                                                                                                                        | 서비스 워커·웹 앱 매니페스트                                                  |
| Test          | <img src="https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white"> <img src="https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white"> <img src="https://img.shields.io/badge/Storybook-FF4785?style=for-the-badge&logo=storybook&logoColor=white"> | E2E, 유닛, 컴포넌트 카탈로그(Chromatic)                                       |
| Quality       | <img src="https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white"> <img src="https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black">                                                                                                                  | 커밋 전 스타일·린트 통일                                                      |
| Delivery      | <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white"> <img src="https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white">                                                                                                              | `output: "standalone"` 이미지와 k8s 매니페스트 예시                           |
| Collaboration | <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white"> <img src="https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white">                                                                                                                        | 브랜치 `develop`, Conventional Commits, Figma 토큰은 CSS에 수동 반영          |

## 사용자 흐름

- 스플래시·홈 진입
- 카카오 또는 네이버 로그인
- 상품 검색·목록·상세
- 장바구니 담기
- 주문서 작성 후 토스 결제
- 주문 완료·영수증
- 마이페이지에서 주문, 배송지, 취소·반품·교환, My냉장고·레시피 확인

### 주요 화면

- **Home** — 히어로 배너, 추천 구좌
- **Search / Products** — 검색, 필터, 상품 목록·상세
- **Cart / Checkout** — 장바구니, 주문서, 배송 상세, 결제 성공·실패·완료
- **My Page** — 프로필, 주문 내역, 배송지, 취소·반품·교환
- **Fridge / Recipe** — 냉장고 채우기, 레시피 추천·최근·찜
- **Login** — 소셜 로그인. 콜백은 `/callback/[provider]`

## 핵심 설계

### 1. BFF

브라우저는 Spring·AI를 직접 호출하지 않습니다. `publicFetch` / `privateFetch`가 `/api/**`만 치고, Route Handler가 `API_INTERNAL_URL`·`AI_SERVICE_INTERNAL_URL`로 프록시합니다. 응답은 Zod로 검증한 뒤 `{ statusCode, message, data }` 봉투로 내려줍니다.

### 2. 인증

로그인 URL과 `redirectUri`는 서버가 계산합니다. Refresh Token은 HttpOnly 쿠키, Access Token은 메모리입니다. 앱 부팅 시 `/api/auth/refresh`로 access를 채우고, 이후 401이면 같은 경로로 한 번만 재발급합니다. 동시 호출은 in-flight Promise로 합칩니다.

### 3. 성능

마켓컬리 실측(메인 PNG 2.4MB, 저속 3G LCP 약 20초, CLS 0.77)을 기준으로 잡았습니다. `<img>` 대신 `next/image`(AVIF·WebP), 종횡비 선고정, LCP 후보만 `preload` + `fetchPriority="high"`, CSS 인라인, Pretendard WOFF2 자체 호스팅을 씁니다. 목표는 홈·상품 상세 LCP 2.5초 미만, CLS 0.1 미만, 접근성 95점 이상입니다.

### 4. 디자인 토큰

Figma 변수를 Style Dictionary로 빌드하지 않습니다. `src/styles/tokens/color.css`·`typography.css`가 소스이고, 변경 시 MCP로 변수를 다시 읽어 CSS에 1:1로 반영합니다.

## 시작하기

```bash
nvm use                  # Node 24.19.0 (.nvmrc)
npm install
cp .env.example .env.local
npm run dev              # http://localhost:3000
```

로컬 백엔드는 서비스마다 포트가 나뉩니다. `API_INTERNAL_URL` 기본값 `http://localhost:4000`에 맞추려면 다른 터미널에서 `npm run dev:gateway`를 먼저 띄웁니다.

| 스크립트                 | 설명                                      |
| ------------------------ | ----------------------------------------- |
| `npm run dev`            | 개발 서버 (Turbopack)                     |
| `npm run dev:gateway`    | 로컬 API 게이트웨이 (포트 4000)           |
| `npm run build`          | 프로덕션 빌드 (`output: "standalone"`)    |
| `npm run start`          | 빌드 결과 실행                            |
| `npm run typecheck`      | `tsc` (앱 + 서비스 워커)                  |
| `npm run lint`           | ESLint                                    |
| `npm run format`         | Prettier                                  |
| `npm run format:check`   | Prettier 검사                             |
| `npm run storybook`      | Storybook (http://localhost:6006)         |
| `npm run test-storybook` | 스토리 렌더·인터랙션 (Vitest)             |
| `npm run test:unit`      | 유닛 테스트                               |
| `npm run e2e:login`      | 소셜 로그인 세션 저장 (헤드풀, 1회)       |
| `npm run e2e`            | Playwright (`e2e/.auth/user.json` 재사용) |

Package manager는 **npm** `11.17.0`입니다. `package-lock.json`으로 버전을 고정합니다.

## 문서

진입점은 [`CLAUDE.md`](./CLAUDE.md)이고, 상세 규칙은 [`.agents/`](./.agents)입니다.

- [API](./.agents/api-convention/SKILLS.md) — BFF, `publicFetch`/`privateFetch`, Zod, 쿼리 키
- [구조](./.agents/structure-convention/SKILLS.md) — 라우트, Atomic Design, 화면별 렌더링
- [코드 스타일](./.agents/code-style-convention/SKILLS.md) — 상태, 폼, 토큰, 이미지, 접근성
- [Git](./.agents/git-convention/SKILLS.md) — 브랜치, Conventional Commits, PR
- [보안](./.agents/security-convention/SKILLS.md) — FE-01~FE-16

컴포넌트 카탈로그는 [Chromatic develop](https://develop--6a978509faf77cfdcaeb125d.chromatic.com/)에 올라갑니다.

## 프로젝트 구조

```text
5issue-client
┣ 📜 CLAUDE.md
┣ 📜 next.config.ts
┣ 📜 package.json
┣ 📂 .agents                 # api / structure / code-style / git / security
┣ 📂 .github                 # CI, PR·이슈 템플릿
┣ 📂 e2e                     # Playwright
┣ 📂 k8s                     # ConfigMap·Deployment 예시
┣ 📂 scripts                 # 로컬 게이트웨이, 아이콘 빌드
┗ 📂 src
  ┣ 📂 app
  ┃ ┣ 📂 (auth)              # 회원가입
  ┃ ┣ 📂 (shop)              # 홈·검색·상품·장바구니·체크아웃·마이페이지
  ┃ ┣ 📂 api                 # Route Handler (BFF)
  ┃ ┗ 📂 callback            # OAuth 콜백
  ┣ 📂 components            # atoms / molecules / organisms
  ┣ 📂 hooks                 # 도메인별 TanStack Query
  ┣ 📂 lib                   # apiClient, env, 인증 쿠키
  ┣ 📂 styles/tokens         # 컬러·타이포 토큰
  ┣ 📂 types                 # Zod 스키마
  ┗ 📜 middleware.ts         # refresh_token 유무로 보호 경로 가드
```

## 배포

`Dockerfile`(3-stage, Node 24.19.0-slim)과 `k8s/*.example.yaml`을 사용합니다. `NEXT_PUBLIC_*`는 빌드 인자로 넣고, `API_INTERNAL_URL`은 런타임 환경변수입니다.

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  --build-arg NEXT_PUBLIC_APP_ENV=production \
  -t 5issue-client:local .
docker run -p 3000:3000 \
  -e API_INTERNAL_URL=http://api.internal \
  -e AI_SERVICE_INTERNAL_URL=http://ai.internal \
  5issue-client:local
```
