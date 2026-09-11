import { withSerwist } from '@serwist/turbopack';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // EKS 배포용: .next/standalone 에 server.js + 최소 node_modules 를 추려 담는다.
  // Vercel 은 자체 서버리스 패키징(Node File Trace)을 쓰는데 standalone 출력과 충돌해
  // "ENOENT .next/next-server.js.nft.json" 로 빌드가 깨진다 — Vercel 빌드(`VERCEL` 환경변수
  // 자동 주입)에서만 끈다. Docker/K8s 빌드는 그대로 standalone 을 쓴다.
  output: process.env.VERCEL ? undefined : 'standalone',
  reactStrictMode: true,
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
