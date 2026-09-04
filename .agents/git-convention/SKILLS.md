# Git 컨벤션 (git-convention)

> 이 문서는 두 부분으로 나뉜다.
>
> - **스코프(1) — 지금 바로 적용**: 브랜치 전략, 커밋 형식, PR 준비 체크리스트, 리뷰 포인트.
> - **⏳ 예정 작업 명세 (스코프 2, 다른 담당자 구현)**: PR/Issue 템플릿, 브랜치 룰셋, husky, CI, Storybook, eslint/prettier 강제.
>   이 부분은 **문서로만 존재한다.** 이 저장소에는 `.husky/`, `.github/`, `.storybook/`, `.eslintrc`, `.prettierrc` 를 만들지 않았다.
>   스코프(2) 담당자가 자기 도구 버전에 맞춰 구조를 잡는다. 아래 명세는 그대로 구현 가능한 수준으로 적었다.

---

# 스코프(1) — 지금 바로 적용

## 1. 브랜치 전략

> Git Flow 라이트 — `develop` 을 통합 브랜치(=GitHub 기본 브랜치)로 두고, `main` 은 배포 가능한 상태의 릴리스 스냅샷만 유지한다.

| 브랜치                   | 목적                          | 분기 원본 | 병합 대상                          | 비고                                                                     |
| ------------------------ | ----------------------------- | --------- | ---------------------------------- | ------------------------------------------------------------------------ |
| `main`                   | 배포 가능한 상태만 (릴리스)   | —         | —                                  | 보호 브랜치. 직접 push 금지. `develop` → `main` PR(릴리스)로만 갱신      |
| `develop`                | 통합/개발 브랜치. 기본 브랜치 | `main`    | —                                  | 보호 브랜치. 직접 push 금지. 모든 기능 브랜치의 분기 원본이자 병합 대상  |
| `feat/<범위>-<요약>`     | 기능 개발                     | `develop` | `develop` (squash)                 | 예: `feat/product-detail-page`                                           |
| `fix/<범위>-<요약>`      | 버그 수정                     | `develop` | `develop` (squash)                 | 예: `fix/cart-qty-race`                                                  |
| `chore/<요약>`           | 빌드/설정/의존성              | `develop` | `develop` (squash)                 | 예: `chore/bump-next-16-3-3`                                             |
| `docs/<요약>`            | 문서만                        | `develop` | `develop` (squash)                 | 예: `docs/api-convention`                                                |
| `refactor/<범위>-<요약>` | 동작 불변 리팩터              | `develop` | `develop` (squash)                 |                                                                          |
| `hotfix/<요약>`          | 운영 긴급 수정                | `main`    | `main` (squash) + `develop` 백머지 | 배포 후 즉시. `main` 에 반영한 뒤 반드시 `develop` 에도 동일 수정을 반영 |

- 브랜치는 **짧게 유지**(수명 2~3일 목표), 자주 `develop` 을 rebase 로 최신화.
- 브랜치명은 소문자 kebab-case. 이슈 번호가 있으면 접미: `feat/search-autocomplete-#123`.
- 한 브랜치 = 한 목적. 관련 없는 변경 섞지 않는다.
- 신규 PR 은 GitHub 기본 브랜치 설정에 따라 `develop` 을 기본 타깃으로 잡는다. `main` 을 대상으로 하는 PR 은 릴리스(`develop`→`main`)와 `hotfix` 뿐이다.

## 2. Conventional Commits

형식:

```
<type>(<scope>): <subject>

<body (선택, 무엇을/왜)>

<footer (선택: BREAKING CHANGE:, Refs: #123)>
```

| type       | 용도                              |
| ---------- | --------------------------------- |
| `feat`     | 기능 추가                         |
| `fix`      | 버그 수정                         |
| `docs`     | 문서만                            |
| `style`    | 포맷/세미콜론 등 (동작 불변)      |
| `refactor` | 리팩터 (기능·버그 아님)           |
| `perf`     | 성능 개선                         |
| `test`     | 테스트 추가/수정                  |
| `build`    | 빌드 시스템·의존성 (next, npm 등) |
| `ci`       | CI 설정                           |
| `chore`    | 기타 잡무                         |
| `revert`   | 되돌리기                          |

규칙:

- `subject` 는 명령형, 소문자 시작, 마침표 없음, 72자 이내. (한글 허용, 동일 원칙)
- `scope` 는 도메인/영역: `product`, `cart`, `auth`, `api`, `ui`, `deps`, `docker`, `infra`…
- 본문은 **무엇을** 바꿨는지보다 **왜** 바꿨는지 위주.
- `BREAKING CHANGE:` 는 footer 에 명시.
- 예:
  ```
  feat(cart): 장바구니 수량 변경 optimistic update 적용

  연속 클릭 시 반영 지연이 커 UX 저하. api-convention §7 3가지 근거 충족 확인.
  onSettled 에서 서버 값으로 수렴시킴.

  Refs: #142
  ```

## 3. PR 준비 체크리스트 (올리는 사람)

- [ ] `develop` 최신 반영(rebase), 충돌 해결 완료
- [ ] 로컬에서 `npm run build` 통과
- [ ] 로컬에서 `npm run typecheck` 통과
- [ ] (스코프 2 도입 후) `lint` / `format:check` 통과
- [ ] 관련 없는 파일 변경 없음(불필요한 포맷 diff 제거)
- [ ] `console.log`, 주석 처리된 코드, 디버그 잔여물 제거
- [ ] 새 엔드포인트면 api-convention §8 체크리스트 수행
- [ ] UI 변경이면 **해당 컴포넌트의 상태 목록(디자인 핸드오프, structure §6-1)** 대로 처리 및 스크린샷 첨부 — 없는 상태는 만들지 않는다
- [ ] 접근성 체크(code-style-convention §5) — 아이콘 버튼 `aria-label`, 대비, 키보드
- [ ] 환경변수 추가 시 `.env.example` 갱신 + `src/lib/env.ts` 스키마 갱신
- [ ] 커밋이 Conventional Commits 형식
- [ ] PR 제목 형식(§ 스코프2 PR 템플릿) 준수, 본문 4개 섹션 작성

## 4. 코드 리뷰 확인 포인트 (리뷰어)

자동 도구가 못 잡는 것 위주로 본다.

| 영역          | 확인                                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 상태 분리     | 서버 응답을 Zustand 에 넣지 않았는가? URL 상태를 로컬 state 로 복제하지 않았는가?                                                          |
| 데이터 흐름   | 컴포넌트가 `fetch` 직접 호출하지 않는가? query hook 경유인가?                                                                              |
| 쿼리 키       | 문자열 하드코딩 없이 키 팩토리를 쓰는가? 무효화 범위가 맞는가?                                                                             |
| Optimistic    | 장바구니 외 도입 시 3가지 근거(api-convention §7)에 답했는가? 롤백/수렴 처리했는가?                                                        |
| RSC 경계      | `"use client"` 가 필요한 잎에만 있는가? 트리 상단에 올라가지 않았는가?                                                                     |
| Zustand       | 모듈 최상단 `create()` 싱글턴이 아닌가? Provider + useRef 패턴인가? useShallow 썼는가?                                                     |
| 접근성        | 아이콘 버튼 라벨, 링크 텍스트, 폼 라벨, 포커스, 대비                                                                                       |
| 이미지        | `next/image` 인가? 종횡비 고정했는가? LCP 후보만 `priority` 인가?                                                                          |
| 스키마        | 응답을 Zod 로 검증하는가? 스키마 위치/명명 규칙 준수?                                                                                      |
| 보안          | security-convention FE 항목 위반 없는가? (특히 FE-02 XSS, FE-05 토큰 저장, FE-09 오픈 리다이렉트)                                          |
| 테스트/스토리 | `Default` + 디자인 핸드오프 상태 목록대로 스토리가 있는가? **없는 상태를 억지로 만들지 않았는가?** 상호작용 컴포넌트면 play 함수가 있는가? |
| 커밋/브랜치   | 브랜치 목적 단일, 커밋 형식 준수                                                                                                           |

리뷰 규모: PR 은 리뷰 가능한 크기로(변경 400줄 이하 권장). 크면 쪼갠다.

---

# ⏳ 예정 작업 명세 (스코프 2, 다른 담당자 구현)

> 아래 7가지는 **실제 파일을 만들지 않았다.** 스코프(2) 담당자가 이 명세대로 구현한다.
> 구체적 패키지 버전은 구현 시점에 최신으로 선택한다.

## (S2-1) PR 템플릿 초안 — `.github/PULL_REQUEST_TEMPLATE.md`

제목 형식(작성자가 직접): `<type>(<scope>): <요약>` — 커밋 컨벤션과 동일. 예) `feat(product): 상품 상세 페이지`

본문 템플릿(마크다운 그대로 사용):

```markdown
## 무엇을 (What)

<!-- 이 PR이 바꾸는 것을 3~5줄로. 스크린샷/GIF는 UI 변경 시 필수. -->

## 왜 (Why)

<!-- 배경/문제/이 방식을 택한 이유. 관련 이슈: Closes #... -->

## 확인 방법 (How to test)

<!-- 리뷰어가 로컬에서 재현할 단계. 필요한 env, 시드 데이터 등. -->

1.
2.

## 영향 범위 · 리스크 (Impact & Risk)

<!-- 영향 받는 화면/도메인, 마이그레이션 필요 여부, 롤백 방법, 성능/보안 영향 -->

---

### 체크리스트

- [ ] `lint` 통과
- [ ] `typecheck` 통과
- [ ] `build` 통과
- [ ] Storybook 테스트(스토리 + play 함수) 통과
- [ ] UI 변경 시 스크린샷/GIF 첨부 (before/after)
- [ ] `.env.example` / `src/lib/env.ts` 갱신 (env 추가 시)
- [ ] 접근성 확인 (code-style-convention §5)
- [ ] 관련 문서(`.agents/**`) 갱신 필요 여부 확인
```

## (S2-2) Issue 템플릿 초안 2종 — `.github/ISSUE_TEMPLATE/`

**버그 리포트 (`bug_report.md` 또는 `bug_report.yml`)** 필수 항목:

- 제목 접두: `[BUG] `
- **요약**: 한 줄
- **재현 절차**: 번호 목록
- **기대 결과** / **실제 결과**
- **환경**: 브라우저·OS·디바이스, 앱 환경(`NEXT_PUBLIC_APP_ENV`), 배포 버전/커밋 SHA
- **스크린샷 / 콘솔 로그 / 네트워크 로그**
- **재현 빈도**: 항상 / 가끔 / 1회
- **심각도**: blocker / critical / major / minor
- **관련 영역(라벨)**: product / cart / auth / checkout / infra …

**기능 요청 (`feature_request.md` 또는 `feature_request.yml`)** 필수 항목:

- 제목 접두: `[FEAT] `
- **배경 / 문제**: 어떤 사용자가 어떤 상황에서 무엇이 불편한가
- **제안**: 원하는 동작
- **대안**: 고려한 다른 방법
- **수용 기준(Acceptance Criteria)**: 체크 가능한 목록
- **디자인/기획 링크**
- **영향 범위 / 우선순위**

`.github/ISSUE_TEMPLATE/config.yml` 로 blank issue 비활성화, 문의 링크(Discussions 등) 연결.

## (S2-3) 브랜치 룰셋 정책 명세 (GitHub Repository Ruleset / Branch protection)

> ✅ 이미 적용됨: `main protection`(main 대상), `develop protection`(develop 대상) 룰셋이
> GitHub Repository Ruleset 으로 실제 등록돼 있다(아래 명세와 동일 조건). 신규 팀원 추가 등
> 조건을 바꿀 때만 이 문서를 먼저 고치고 룰셋을 맞춘다.
>
> **2026-09-04 변경(#41)**: "대화 해결 필수"(`required_review_thread_resolution`)를 **끈다**. 사유는 아래 해당 항목 참고.

`main`, `develop` 브랜치 공통 대상:

- **직접 push 금지** — 변경은 PR 로만.
- **PR 필수**, 병합 전 **최소 승인 리뷰어 1명** (팀 확장 시 2명 검토).
- **Stale 리뷰 자동 해제**: 새 커밋 push 시 기존 승인 무효화.
- **병합 전 필수 상태 체크(Required status checks)** — 전부 통과해야 병합 가능:
  - `lint`
  - `format:check`
  - `typecheck`
  - `build`
  - `storybook-test` (스토리 + interaction/play 테스트)
- **브랜치 최신화 필수**: "Require branches to be up to date before merging".
- **force-push 금지**, **브랜치 삭제 금지**(main, develop).
- **linear history 필수** (merge commit 금지).
- **병합 방식: Squash and merge 권장** (1 PR = 1 커밋, 커밋 메시지는 PR 제목=Conventional Commits).
  - Rebase merge 허용 가능, Merge commit 비활성화.
- **대화(conversation) 해결**: GitHub 룰셋의 **필수 강제는 끈다**(`required_review_thread_resolution: false`, #41).
  - 이유: CodeRabbit 봇이 조언성 스레드를 대량 생성하는데 GitHub 이 봇/사람 스레드를 구분하지 못해, 강제 시 "스토리 하나 더" 같은 코멘트까지 전부 머지 블로커가 된다. CodeRabbit 은 **필수 상태 체크가 아니다**(조언만 — `.coderabbit.yaml` `request_changes_workflow: false`).
  - 실질 게이트: **승인 리뷰어 1명 + 필수 상태 체크(`Lint · Type · Format · Build`, `Storybook build · test`)**. 리뷰어는 반영이 꼭 필요한 스레드가 있으면 **승인을 보류**해 게이트한다.
  - 봇 스레드 정리: `@coderabbitai resolve`(top-level 코멘트) 또는 GitHub UI 에서 수동 resolve. 필수는 아님.
- 관리자에게도 규칙 적용(Include administrators), 우회는 명시적 bypass 목록으로만.
- 태그 보호: `v*` 릴리스 태그 생성/삭제 제한.

## (S2-4) `.husky` 훅 명세

패키지: `husky` + `lint-staged`. `package.json` 에 `"prepare": "husky"` 추가, `npx husky init`.

**`.husky/pre-commit`** — 스테이징된 파일에 대해 `lint-staged` 실행:

```bash
npx lint-staged
```

`lint-staged` 설정(`package.json` 의 `"lint-staged"` 또는 `lint-staged.config.js`):

```jsonc
{
  "*.{ts,tsx}": ["eslint --fix --max-warnings=0", "prettier --write"],
  "*.{json,css,md,mjs,yaml,yml}": ["prettier --write"],
}
```

- `*.ts,*.tsx` → `eslint --fix` 후 `prettier --write`
- `*.json / *.css / *.md`(및 mjs/yaml) → `prettier --write`
- 타입 체크는 pre-commit 에서 하지 않는다(느림) → CI 에서.

**`.husky/commit-msg`** — Conventional Commits 정규식 강제:

```bash
npx --no -- commitlint --edit "$1"
```

`commitlint.config.js`: `extends: ["@commitlint/config-conventional"]`.

commitlint 없이 순수 정규식으로 검증할 경우(`.husky/commit-msg` 스크립트 내):

```bash
# 허용: type(scope)!: subject   / scope 와 ! 는 선택
pattern='^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9\-]+\))?(!)?: .{1,72}$'
head -1 "$1" | grep -Eq "$pattern" || {
  echo "✗ 커밋 메시지가 Conventional Commits 형식이 아닙니다."
  echo "  예) feat(cart): 수량 변경 optimistic update"
  exit 1
}
```

**`.husky/pre-push`**(선택) — `npm run typecheck` 를 push 전에 1회.

## (S2-5) CI typecheck 잡 명세 — `.github/workflows/ci.yml`

- **트리거**: `pull_request` (모든 PR) + `push` (main).
- **동시성**: 같은 ref 의 이전 실행 취소(`concurrency: group: ci-${{ github.ref }}, cancel-in-progress: true`).
- **잡 1: `verify`** (스텝 순서 고정):
  1. `actions/checkout`
  2. `actions/setup-node` — `node-version-file: .nvmrc`, `cache: npm`
  3. `npm ci`
  4. `npm run lint`
  5. `npm run format:check` (`prettier --check .`)
  6. `npm run typecheck` (`tsc -p tsconfig.json --noEmit && tsc -p tsconfig.sw.json --noEmit`)
  7. `npm run build`
- **잡 2: `storybook-test`** (별도 잡으로 분리 권장 — 무겁고 flaky 가능):
  1~3. 동일 (checkout / setup-node / npm ci) 4. Playwright 브라우저 설치 (`npx playwright install --with-deps chromium`) 5. `npm run build-storybook` 6. `npm run test-storybook`(`@storybook/test-runner`, 정적 빌드에 http-server 물려 실행)
- 두 잡 모두 브랜치 룰셋의 required status checks 에 등록(`verify` 안의 개별 스텝이 아니라 잡 이름으로).
- `package.json` 스크립트로 추가 필요: `lint`, `format`, `format:check`, `build-storybook`, `test-storybook`.

## (S2-6) Storybook `/stories` 폴더 규약 명세

- 스토리 파일은 **컴포넌트 옆에 co-location**: `ProductCard.tsx` 옆에 `ProductCard.stories.tsx`.
  - `src/stories/` 는 Storybook 초기 예제 전용(삭제 또는 온보딩 문서용으로만).
- **CDD 순서**(code-style-convention §2)를 지켜 작성: Props → 표현 컴포넌트 → 상태 분기 → **스토리** → 컨테이너 연결.
- 스토리 필수 구성:
  - `Meta` 에 `title`(도메인 계층: `Product/ProductCard`), `component`, `args`, `argTypes`, `tags: ["autodocs"]`.
  - **상태별 스토리**: **디자인팀이 그 컴포넌트에 대해 넘긴 상태값 목록**(structure §6-1)의 각 상태마다 1개. `Default` 는 항상, 나머지(`Loading`/`Empty`/`Error`/`SoldOut`/`Disabled` 등)는 **그 목록에 있을 때만**. 설계상 없는 상태(`Calendar` 의 로딩, 정적 옵션 select-only `Dropdown` 의 에러 등)는 스토리를 만들지 않는다 — 리뷰(사람·자동 도구)도 이를 요구하지 않는다.
  - **인터랙션 테스트**: 상호작용 있는 컴포넌트는 `play` 함수로 시나리오 검증(`@storybook/test` 의 `userEvent`, `expect`).
  - a11y 애드온(`@storybook/addon-a11y`) 활성화, 스토리별 위반 0 목표.
- **주의사항 (flaky)**: `motion` / 애니메이션 컴포넌트는 자동 a11y 스캔이 **전환 중 스냅샷을 잡아 간헐적으로 실패**한다.
  - 대응: 스토리 파라미터로 애니메이션 비활성화(`parameters: { chromatic: { disableSnapshot }, a11y: { ... } }`), 또는 `play` 에서 `waitFor` 로 전환 완료 후 검증, 또는 해당 스토리만 a11y 자동 검사를 `test: "off"` 로 두고 수동 확인.
- CI 는 (S2-5) 잡 2 에서 `test-storybook` 으로 스토리 렌더 + play 통과를 검증.

## (S2-7) eslint / prettier 강제 구성 명세

- **근거·내용은 `code-style-convention` 의 "10. eslint 규칙 매핑 예시" 표를 그대로 참조한다.**
  ([../code-style-convention/SKILLS.md](../code-style-convention/SKILLS.md) §10)
- 역할 분리:
  - **prettier = 포맷 전담** (들여쓰기 2, 큰따옴표, 세미콜론, 후행 쉼표 all, printWidth 100). `.prettierrc` + `.prettierignore`.
  - **eslint = 품질 전담** (미사용 코드, 접근성, 위험 패턴, import 순서). flat config(`eslint.config.mjs`).
- **`eslint-config-prettier`** 로 eslint 의 포맷 관련 규칙을 전부 끈다(충돌 제거). eslint 는 "포맷"을 검사하지 않는다.
- eslint 최소 구성 축(패키지 버전은 스코프 2 가 최신 선택):
  - `@eslint/js` recommended
  - `typescript-eslint` (typescript 6.0.x 와 호환되는 버전 — 이 저장소가 TS 를 6.0.3 으로 고정한 이유)
  - `eslint-config-next` (`@next/next` 규칙, `no-img-element` 등)
  - `eslint-plugin-jsx-a11y` (recommended 이상)
  - `eslint-plugin-import` 또는 `eslint-plugin-perfectionist` (import 순서)
  - 커스텀 `no-restricted-imports` / `no-restricted-syntax` 로 매핑 표의 "근사치" 항목 방어
- `package.json` 스크립트: `"lint": "eslint ."`, `"format": "prettier --write ."`, `"format:check": "prettier --check ."`.
- CI(S2-5)와 husky(S2-4)가 이 스크립트를 호출한다.
- **자동화 불가 규칙**(서버/클라 상태 분리, useShallow 강제, 색 대비)은 eslint 로 완전 강제 불가 → PR 리뷰 체크리스트(§4)로 보완한다.
