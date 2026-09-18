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
  // 기본값(resizes-visual)은 키보드가 떠도 레이아웃 뷰포트(dvh, window.innerHeight)가
  // 줄어들지 않고 시각 뷰포트만 줄어든다 — 그러면 "스크롤을 끝까지 올리면 키보드와
  // 40px 간격" 같은 레이아웃 기반 계산이 실제 화면과 안 맞는다(#69 검색 화면 하단
  // 여백). resizes-content 로 레이아웃 뷰포트 자체를 키보드만큼 줄여 dvh/스크롤
  // 계산이 실제 보이는 영역과 일치하게 만든다.
  interactiveWidget: 'resizes-content',
};

// 다크모드는 지금 마이컬리 화면에서만 켜진다(2026-09-18, "우선 마이컬리만" 결정) —
// `<html>` 은 테마를 모르는 채로 항상 라이트로 렌더한다. `ThemeScope`(마이컬리
// 서브트리 wrapper)가 자기 자신에게 `data-theme` 을 붙이고 그 안에서만 FOUC 를
// 감당한다(molecules/shared/ThemeScope 참고) — 전역 인라인 스크립트/hydration
// 예외 처리가 더 이상 여기 필요 없다.
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
