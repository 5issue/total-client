# 보안 컨벤션 (security-convention)

> 스코프(1) 실제 문서. 보안팀 프론트엔드 시큐어 코딩 가이드(FE-01 ~ FE-16)를 이 프로젝트 구조에 맞게 정리한다.
> 각 항목의 **"이 프로젝트 적용 지점"** 은 현재 코드 기준이며, 아직 파일이 없으면 **⏳ 예정** 으로 표시한다.
> PR 리뷰(git-convention §4)와 CI(스코프 2)가 이 문서를 검증 기준으로 삼는다.

---

## 요약 표

| ID    | 항목                              | 심각도 | 자동 검출          | 현재 상태                              |
| ----- | --------------------------------- | ------ | ------------------ | -------------------------------------- |
| FE-01 | 민감정보 클라이언트 저장 금지     | 높음   | 부분(리뷰)         | 규칙 수립                              |
| FE-02 | XSS 방지                          | 높음   | 부분(eslint)       | 규칙 수립                              |
| FE-03 | 민감정보 로깅 금지                | 중간   | 부분(`no-console`) | 규칙 수립                              |
| FE-04 | 전송 구간 암호화(HTTPS)           | 높음   | CI/인프라          | ⏳ 헤더·인프라                         |
| FE-05 | 인증 토큰 처리                    | 높음   | 아니오             | ⏳ `api/auth`                          |
| FE-06 | CSRF 방지                         | 높음   | 아니오             | ⏳ Route Handler                       |
| FE-07 | 서버 응답 신뢰 경계(스키마 검증)  | 중간   | 부분(리뷰)         | 규칙 수립 (`src/types`)                |
| FE-08 | 의존성 취약점 관리                | 중간   | `npm audit`        | 진행 중 (lockfile 존재)                |
| FE-09 | 오픈 리다이렉트 방지              | 중간   | 아니오             | ⏳ 로그인 redirect                     |
| FE-10 | 시크릿 하드코딩 금지              | 높음   | 시크릿 스캐너      | 규칙 수립 (`src/lib/env.ts`)           |
| FE-11 | 보안 응답 헤더                    | 중간   | CI 검사 가능       | ⏳ `next.config.ts` headers            |
| FE-12 | 클릭재킹 방지                     | 중간   | CI 검사 가능       | ⏳ `frame-ancestors`                   |
| FE-13 | 외부 링크 `rel` 처리              | 낮음   | eslint             | 규칙 수립                              |
| FE-14 | 파일 업로드 검증                  | 중간   | 아니오             | ⏳ 해당 기능 없음                      |
| FE-15 | 인가는 서버에서(클라 가드는 UX용) | 높음   | 아니오             | ⏳ `middleware.ts` + API               |
| FE-16 | 에러 처리 시 내부정보 비노출      | 중간   | 부분(리뷰)         | 규칙 수립 (`api-convention` 응답 포맷) |

---

## FE-01. 민감정보 클라이언트 저장 금지

- 인증 토큰·리프레시 토큰·개인정보(주민번호, 카드번호, 주소 원문)를 `localStorage` / `sessionStorage` / `IndexedDB` / 비-HttpOnly 쿠키에 저장하지 않는다.
- Zustand 스토어(클라 상태)에도 토큰/PII 를 두지 않는다. 서버 상태는 Query 캐시(메모리)에만, 민감 필드는 마스킹.
- 결제/카드 정보는 PG 위젯(iframe/SDK)에 위임하고 우리 앱이 원본을 만지지 않는다.
- **이 프로젝트 적용 지점**: `src/stores/ui-store.ts` 는 UI 플래그만 보유(현재 OK). PWA 서비스 워커(`src/app/sw.ts`) 런타임 캐시(`defaultCache`)가 인증된 API 응답을 캐시하지 않도록 확인 — ⏳ `privateFetch` 경로는 `NetworkOnly` 로 분류.

## FE-02. XSS 방지

- `dangerouslySetInnerHTML` 사용 금지. 불가피하면 `DOMPurify` 등으로 sanitize 후, 허용 태그/속성 화이트리스트를 코드 리뷰로 승인.
- 사용자 입력을 `href`/`src` 에 넣을 때 `javascript:`, `data:` 스킴 차단(스킴 화이트리스트 `https:`, `mailto:`, `tel:`).
- React 의 기본 이스케이프를 신뢰하되, `ref` 로 DOM 직접 조작 시 `innerHTML` 금지.
- CSP(FE-11)로 인라인 스크립트 차단을 이중 방어.
- **이 프로젝트 적용 지점**: 현재 `dangerouslySetInnerHTML` 없음. 상품 상세 설명(HTML) 렌더가 생기면 ⏳ sanitize 유틸(`src/lib/sanitize.ts`) 신설 + 리뷰 필수.

## FE-03. 민감정보 로깅 금지

- `console.*`, 에러 리포팅(Sentry 등), 분석 이벤트에 토큰·비밀번호·PII·Authorization 헤더를 남기지 않는다.
- 네트워크 로깅/디버그 코드는 커밋 금지(`no-console` 는 `warn`/`error` 만 허용 — code-style §9).
- 에러 객체를 통째로 로깅하지 말고 필요한 필드만.
- **이 프로젝트 적용 지점**: ⏳ 에러 리포팅 도입 시 `beforeSend` 스크러버 구성. Route Handler 에러 로깅은 서버에서만, 요청 바디 마스킹.

## FE-04. 전송 구간 암호화 (HTTPS)

- 운영은 전 구간 HTTPS. 혼합 콘텐츠(HTTP 리소스) 금지.
- `NEXT_PUBLIC_API_URL` 은 운영에서 반드시 `https://`. `src/lib/env.ts` 의 `z.string().url()` 에 더해 운영 환경에서는 https 스킴 검증 추가 고려.
- **이 프로젝트 적용 지점**: ⏳ Ingress/ALB TLS 종단 + `Strict-Transport-Security` 헤더(FE-11). 내부 통신(`API_INTERNAL_URL`)은 클러스터 내부이나 가능하면 mTLS/서비스메시.

## FE-05. 인증 토큰 처리

- 액세스/리프레시 토큰은 **`HttpOnly` + `Secure` + `SameSite=Lax`(또는 `Strict`) 쿠키**로만. JS 에서 읽을 수 없어야 한다.
- 토큰 발급·갱신·삭제는 **우리 Route Handler(`src/app/api/auth/**`)** 가 전담. 브라우저는 외부 인증 서버와 직접 통신하지 않는다(api-convention §3).
- 401 응답 시 `privateFetch` 가 refresh 를 1회 시도 → 실패 시 세션 정리 + 로그인 유도.
- **이 프로젝트 적용 지점**: ⏳ `src/app/api/auth/` 및 `src/lib/apiClient.ts` 의 `privateFetch`.

## FE-06. CSRF 방지

- 쿠키 기반 인증이므로 상태 변경 요청(POST/PUT/PATCH/DELETE)은 CSRF 방어 필요.
- 1차 방어: `SameSite=Lax/Strict` 쿠키.
- 2차 방어: Route Handler 에서 `Origin`/`Referer` 검사(허용 도메인 화이트리스트), 필요 시 double-submit 토큰.
- GET 은 부수효과 없게(멱등).
- **이 프로젝트 적용 지점**: ⏳ `src/app/api/**/route.ts` 공통 미들웨어(`assertSameOrigin(req)`).

## FE-07. 서버 응답 신뢰 경계

- 외부 API / 우리 Route Handler 응답을 **신뢰하지 않는다.** api-client 계층에서 **Zod `parse`** 로 검증 후에만 사용(api-convention §3, §5).
- 검증 실패는 사용자에게 "일시적 오류"로 표시하고 서버에 로깅(민감정보 제외).
- 숫자/날짜/enum 은 파싱 계층에서 정규화(`z.coerce`, `z.enum`).
- **이 프로젝트 적용 지점**: `src/types/` (폴더 존재, 스키마는 ⏳), `src/lib/apiClient.ts` (⏳).

## FE-08. 의존성 취약점 관리

- `package-lock.json` 커밋(존재함). 설치는 `npm ci`.
- 버전 고정(이 저장소는 핵심 툴체인을 정확히 고정 — `package.json`, `.nvmrc`).
- 정기 `npm audit` (CI 에서 `npm audit --audit-level=high` 비차단 리포트 → 주기적 처리).
- ⏳ Renovate/Dependabot 로 업데이트 PR 자동화(스코프 2 CI 와 함께).
- 새 의존성 추가 시 리뷰에서 필요성/유지보수/번들 영향 확인(code-style §8).
- npm 11 의 `allow-scripts` 정책상 postinstall 스크립트는 기본 차단된다. 네이티브 바이너리 패키지(`esbuild`, `@swc/core`)는 optionalDependencies 로 동작하므로 현재 문제 없음. 스크립트 승인이 필요한 패키지가 생기면 리뷰에서 명시적으로 검토.

## FE-09. 오픈 리다이렉트 방지

- 로그인 후 복귀(`?redirect=`), 딥링크 등에서 **오직 자사 경로(상대경로, `/` 로 시작, `//` 아님)** 만 허용.
- 절대 URL / 프로토콜 상대(`//evil.com`) / `\` 우회 차단.

```ts
export function safeRedirect(target: string | null): string {
  if (!target) return '/';
  if (!target.startsWith('/') || target.startsWith('//') || target.includes('\\')) return '/';
  return target;
}
```

- **이 프로젝트 적용 지점**: ⏳ `(auth)/login` + `src/middleware.ts` 의 `redirect` 처리, `src/lib/safeRedirect.ts`.

## FE-10. 시크릿 하드코딩 금지

- API 키·토큰·비밀번호를 소스에 넣지 않는다. `src/lib/env.ts` 를 통해서만 접근.
- **`NEXT_PUBLIC_` 접두어 오용 주의**: 이 값은 브라우저 번들에 인라인된다. 서버 전용 비밀은 절대 `NEXT_PUBLIC_` 를 붙이지 않는다(`API_INTERNAL_URL`, 토큰 등).
- `.env*` 는 `.env.example` 만 커밋(`.gitignore` 확인됨). 실제 값은 K8s Secret(`k8s/secret.example.yaml` 참고).
- ⏳ CI 에 시크릿 스캐너(gitleaks/trufflehog) 추가(스코프 2).
- **이 프로젝트 적용 지점**: `src/lib/env.ts` (존재), `.env.example` (존재), `k8s/` (존재).

## FE-11. 보안 응답 헤더

`next.config.ts` 의 `async headers()` 또는 `src/middleware.ts` 로 전역 적용:

| 헤더                        | 값(초안)                                                                                                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Content-Security-Policy`   | `default-src 'self'; img-src 'self' https: data:; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' <API_URL>; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload`                                                                                                                                                    |
| `X-Content-Type-Options`    | `nosniff`                                                                                                                                                                                         |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`                                                                                                                                                                 |
| `X-Frame-Options`           | `DENY` (CSP `frame-ancestors` 보완)                                                                                                                                                               |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=(), interest-cohort=()`                                                                                                                                    |

- CSP 는 Next inline 스크립트(RSC) 때문에 nonce 전략이 필요할 수 있음 → ⏳ `middleware` 에서 nonce 발급 + `script-src 'nonce-...'`.
- **이 프로젝트 적용 지점**: ⏳ `next.config.ts` / `src/middleware.ts`.

## FE-12. 클릭재킹 방지

- CSP `frame-ancestors 'none'` + `X-Frame-Options: DENY` (FE-11).
- 자사 콘텐츠를 iframe 으로 임베드해야 하는 경우만 특정 origin 허용.
- **이 프로젝트 적용 지점**: ⏳ FE-11 헤더와 동일 위치.

## FE-13. 외부 링크 `rel` 처리

- `target="_blank"` 링크는 `rel="noopener noreferrer"` 필수(탭 내빙/레퍼러 유출 방지).
- 공용 `<ExternalLink>` 컴포넌트로 강제.
- eslint `react/jsx-no-target-blank` 로 검출(code-style §10).
- **이 프로젝트 적용 지점**: ⏳ `src/components/atoms/ExternalLink.tsx`.

## FE-14. 파일 업로드 검증

- 클라: 확장자·MIME·크기 1차 검증(UX). 서버(Route Handler)에서 **재검증**(매직 넘버, 크기 상한, 파일명 정규화).
- 이미지 리뷰 첨부 등은 프리사인 URL + 별도 스토리지, 실행 권한/경로 노출 없이.
- **이 프로젝트 적용 지점**: ⏳ 현재 업로드 기능 없음. 도입 시 `src/lib/apiClient.ts`(업로드 엔드포인트) + 서버 검증.

## FE-15. 인가는 서버에서

- `src/middleware.ts` 의 라우트 가드와 클라이언트 조건부 렌더는 **UX 목적**일 뿐, 보안 경계가 아니다.
- 실제 인가(본인 주문만 조회, 관리자 기능 등)는 **Route Handler / 외부 API 가 매 요청 검증**한다.
- IDOR 방지: `/orders/[id]` 는 서버에서 "요청자 == 주문 소유자" 확인. 목록도 서버가 소유자 스코프로 필터.
- **이 프로젝트 적용 지점**: ⏳ `src/app/api/orders/**`, `src/middleware.ts`.

## FE-16. 에러 처리 시 내부정보 비노출

- 사용자에게 스택트레이스·SQL·내부 URL·서버 버전을 노출하지 않는다.
- 공용 응답 포맷(api-convention §6)의 `message` 는 사용자 친화 문구, 상세는 서버 로그.
- `app/error.tsx`, `app/not-found.tsx`, `app/global-error.tsx` 로 일관된 폴백 UI. `error.digest` 만 노출(추적용).
- 404/403/500 을 구분해 사용자 안내(단, 존재 여부 노출이 민감한 리소스는 403 대신 404 처리 검토).
- **이 프로젝트 적용 지점**: ⏳ `src/app/error.tsx` 등, `src/lib/apiResponse.ts` 의 `fail()`.

---

## 릴리스 전 보안 체크리스트

- [ ] FE-05/06: 토큰이 HttpOnly 쿠키인가, 상태변경 API 에 Origin 검증이 있는가
- [ ] FE-07: 새 API 응답에 Zod 스키마 검증이 있는가
- [ ] FE-09: 새 redirect 파라미터에 `safeRedirect` 를 적용했는가
- [ ] FE-10: `NEXT_PUBLIC_` 로 서버 비밀이 새지 않는가 (`git grep NEXT_PUBLIC_` 검토)
- [ ] FE-11/12: 보안 헤더가 응답에 실려 나가는가 (`curl -I`)
- [ ] FE-15: 새 개인화/소유 리소스에 서버측 인가가 있는가 (IDOR 테스트)
- [ ] FE-08: `npm audit` high 이상 이슈 처리 또는 예외 승인
- [ ] FE-01: 서비스 워커가 인증 응답을 캐시하지 않는가
