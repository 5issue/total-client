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
  // 기본값(resizes-visual)은 키보드가 떠도 레이아웃 뷰포트(dvh, window.innerHeight)가
  // 줄어들지 않고 시각 뷰포트만 줄어든다 — 그러면 "스크롤을 끝까지 올리면 키보드와
  // 40px 간격" 같은 레이아웃 기반 계산이 실제 화면과 안 맞는다(#69 검색 화면 하단
  // 여백 버그). resizes-content 로 레이아웃 뷰포트 자체를 키보드만큼 줄여 dvh/스크롤
  // 계산이 실제 보이는 영역과 일치하게 만든다.
  // ⚠️ 한 번 되돌렸었다 — 당시 이 옵션을 켠 직후 하단 탭바 숨김이 깨지는 걸 보고
  // 이게 원인인 줄 알았는데, 진짜 원인은 `SearchPageHeader` 의 `autoFocus`(제거함,
  // 그 커밋 주석 참고)였다. autoFocus 제거 후 재적용해 정상 확인했다.
  interactiveWidget: 'resizes-content',
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
