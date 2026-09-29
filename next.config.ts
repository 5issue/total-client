import { withSerwist } from '@serwist/turbopack';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // EKS 배포용: .next/standalone 에 server.js + 최소 node_modules 를 추려 담는다.
  // Vercel 은 자체 서버리스 패키징(Node File Trace)을 쓰는데 standalone 출력과 충돌해
  // "ENOENT .next/next-server.js.nft.json" 로 빌드가 깨진다 — Vercel 빌드(`VERCEL` 환경변수
  // 자동 주입)에서만 끈다. Docker/K8s 빌드는 그대로 standalone 을 쓴다.
  output: process.env.VERCEL ? undefined : 'standalone',
  reactStrictMode: true,
  // 실기기(폰)에서 같은 네트워크의 맥 IP로 접속해 dev 서버를 테스트할 때 필요 —
  // 없으면 Next 16 이 보안상 localhost 가 아닌 origin 의 dev 리소스(JS 청크 등)
  // 요청을 전부 차단해, 페이지는 뜨지만 React 가 전혀 하이드레이션되지 않는다
  // (겉보기엔 정상인데 클릭/상태 변화가 하나도 안 먹히는 것처럼 보임).
  // 로컬 IP 가 달라 커밋된 고정값으로는 공유할 수 없다 — 각자
  // `.env.local` 에 DEV_LAN_IP 를 설정한다(`.env.example` 참고). 미설정 시
  // LAN 접속 기능이 꺼진다(빈 배열).
  allowedDevOrigins: process.env.DEV_LAN_IP ? [process.env.DEV_LAN_IP] : [],
  // Next 16 이 매 빌드/개발마다 루트 AGENTS.md / CLAUDE.md 를 자동 생성/덮어쓴다.
  // 이 저장소는 CLAUDE.md 를 "문서 인덱스"로 직접 관리하므로 비활성화한다.
  agentRules: false,
  images: {
    // 경쟁사(마켓컬리) 실측: 메인 이미지 PNG 2.4MB, LCP ~20s, CLS 0.77.
    // → next/image 강제 + 종횡비 고정으로 대응 (structure-convention 참고).
    formats: ['image/avif', 'image/webp'],
    // AI 파트 레시피 추천/상세(`image_url`)가 식품안전나라(공공 데이터) 이미지를 그대로
    // 반환한다 — 화이트리스트에 없으면 next/image 가 렌더링 자체를 막아 화면이 깨진다
    // (실제 재현, 2026-09-28).
    //
    // product-service(`GET /api/v1/products`, `/home-recommendations` 등)가 내려주는
    // 상품 이미지도 마찬가지로 화이트리스트가 없어 URI 인코딩 여부와 무관하게 항상
    // 차단됐다(#155, 지훈님 제보) — 실제 도메인은 total-backend product-service
    // `V5__seed_demo_products.sql` 실측으로 확인(img-cf/product-image 두 개, 리사이즈
    // 경로가 `/hdims/...`·`/shop/...`·`/product/...` 로 다양해 pathname 은 `/**`).
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'www.foodsafetykorea.go.kr',
        pathname: '/uploadimg/**',
      },
      {
        protocol: 'https',
        hostname: 'img-cf.kurly.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'product-image.kurly.com',
        pathname: '/**',
      },
    ],
    // 기본 75 외에 90 도 허용 — 히어로 배너가 압축 열화를 줄이려 quality={90} 을 쓴다
    // (PR #85 리뷰 — "이미지가 뿌옇게 보인다"). Next 16 은 안 쓰는 quality 값을 빌드
    // 경고/차단하므로 실제로 쓰는 값만 화이트리스트에 올린다.
    qualities: [75, 90],
  },
};

// next.config 를 반드시 withSerwist 로 감싸야 /serwist/[path] Route Handler 가 동작한다.
export default withSerwist(nextConfig);
