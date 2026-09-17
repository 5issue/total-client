'use client';

import { FloatingButton } from '@/components/atoms/FloatingButton';
import { FullScreenErrorState } from '@/components/molecules/shared/FullScreenErrorState';
import '@/styles/globals.css';

/**
 * 전역 에러 바운더리 — Figma 665-59920(database-error 도안 기준). 루트 레이아웃까지
 * 무너진 상태를 대체하므로 Next.js 요구사항대로 html/body를 직접 그리고, 루트
 * `layout.tsx`를 거치지 않아 globals.css도 여기서 다시 import한다.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body>
        <FullScreenErrorState
          illustration="database-error"
          title="서버와 연결할 수 없습니다"
          description="잠시 후 다시 시도해 주세요"
          action={
            <FloatingButton icon="refresh" onClick={reset}>
              서버 확인 및 재시도
            </FloatingButton>
          }
        />
      </body>
    </html>
  );
}
