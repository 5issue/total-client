import type { ReactNode } from 'react';

import { SerwistProvider } from '@serwist/turbopack/react';
import type { Metadata, Viewport } from 'next';

import { Providers } from './providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'total-client',
    template: '%s | total-client',
  },
  description: '통합 이커머스 프론트엔드',
  applicationName: 'total-client',
  // 홈 화면에 추가한 PWA(standalone)에서 상태바 색을 실제 페이지 색으로 비치게 한다.
  // iOS 는 이 값이 있어야 상태바를 렌더하고(`theme-color` 메타만으로는 standalone 모드에
  // 적용 안 됨), `black-translucent` 는 상태바를 투명 처리해 그 아래 콘텐츠(퍼플 헤더
  // 배경)가 그대로 비쳐 보이게 한다 — Figma 목업(node 2438:1393)의 퍼플 상태바와 같은 효과.
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'total-client',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // 접근성: user-scalable=no / maximum-scale 로 확대를 막지 않는다.
  // 브라우저 크롬(상태바/주소창) 색상 = Brand/Primary(#690085) — 홈 헤더와 동일
  // (src/styles/tokens/color.css --primary). 디자인 시스템에 다크 팔레트 미정의.
  themeColor: '#690085',
  // black-translucent 상태바가 콘텐츠 위에 겹쳐지려면 뷰포트가 노치/상태바 영역까지
  // 덮어야 한다 — 실제 콘텐츠는 안전영역(safe-area-inset-*)만큼 패딩으로 밀어낸다.
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" dir="ltr">
      <body>
        {/* swUrl 은 반드시 src/app/serwist/[path]/route.ts 의 경로와 일치해야 한다. */}
        <SerwistProvider swUrl="/serwist/sw.js">
          <Providers>{children}</Providers>
        </SerwistProvider>
      </body>
    </html>
  );
}
