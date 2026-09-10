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
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // 접근성: user-scalable=no / maximum-scale 로 확대를 막지 않는다.
  // 브라우저 크롬 색상 = Figma Surface/base. 디자인 시스템에 다크 팔레트 미정의.
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" dir="ltr">
      <body>
        {/* swUrl 은 반드시 src/app/serwist/[path]/route.ts 의 경로와 일치해야 한다.
            개발 모드에선 disable — 서비스워커가 실기기(특히 iOS Safari)에 설치되면
            이후 dev 서버 변경사항이 코드로는 반영돼도 캐시된 옛 페이지/JS 가 계속
            서빙돼 새로고침해도 안 바뀌는 것처럼 보인다(#69 실기기 디버깅 중 발견). */}
        <SerwistProvider swUrl="/serwist/sw.js" disable={process.env.NODE_ENV !== 'production'}>
          <Providers>{children}</Providers>
        </SerwistProvider>
      </body>
    </html>
  );
}
