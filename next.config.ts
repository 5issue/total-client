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
  },
};

// next.config 를 반드시 withSerwist 로 감싸야 /serwist/[path] Route Handler 가 동작한다.
export default withSerwist(nextConfig);
