# total-client

통합 이커머스 프론트엔드 저장소 — Next.js 16 App Router.

## 시작하기

```bash
nvm use                  # Node 24.19.0 (.nvmrc)
npm install
cp .env.example .env.local
npm run dev              # http://localhost:3000
```

## 스크립트

| 스크립트            | 설명                                   |
| ------------------- | -------------------------------------- |
| `npm run dev`       | 개발 서버 (Turbopack)                  |
| `npm run build`     | 프로덕션 빌드 (`output: "standalone"`) |
| `npm run start`     | 빌드 결과 실행                         |
| `npm run typecheck` | `tsc` 타입 검사 (앱 + 서비스 워커)     |

## 문서

프로젝트 표준·컨벤션은 [`CLAUDE.md`](./CLAUDE.md) 를 진입점으로 하며, 상세 규칙은
[`.agents/`](./.agents) 아래 5개 `SKILLS.md` 에 있다.

- `.agents/api-convention/` — API 계층 아키텍처, 응답 포맷, 쿼리 키, Optimistic 정책
- `.agents/structure-convention/` — 라우트 그룹, 화면 목록, 폴더 트리, 이미지 규칙
- `.agents/code-style-convention/` — 명명·상태관리·접근성·이미지, eslint/prettier 근거
- `.agents/git-convention/` — 브랜치/커밋/PR + 스코프2 예정 작업 명세
- `.agents/security-convention/` — FE-01~FE-16 시큐어 코딩

## 배포

`Dockerfile` (3-stage, Node 24.19.0-slim) + `k8s/*.example.yaml` 참고.

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  --build-arg NEXT_PUBLIC_APP_ENV=production \
  -t total-client:local .
docker run -p 3000:3000 -e API_INTERNAL_URL=http://api.internal total-client:local
```
