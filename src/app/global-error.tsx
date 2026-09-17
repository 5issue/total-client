'use client';

import Image from 'next/image';

import { FloatingButton } from '@/components/atoms/FloatingButton';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import '@/styles/globals.css';

/**
 * 전역 에러 바운더리 — Figma 665-59920(일반 서버 오류, 해당 프레임엔 결제 오류 문구가
 * 잘못 들어가 있어 이슈 #108 논의대로 `database-error` 도안 + 원안 스펙 문구로 대체).
 * 루트 레이아웃까지 무너진 상태를 대체하므로 Next.js 요구사항대로 `<html>`/`<body>` 를
 * 직접 그리고 전역 스타일을 이 파일에서 다시 import 한다(루트 `layout.tsx` 를
 * 거치지 않기 때문). `Providers`/`SerwistProvider` 는 이 화면에서 쓰이지 않아 감싸지 않는다.
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
        <div className="bg-surface mx-auto flex min-h-dvh max-w-screen-sm flex-col items-center justify-center px-6">
          <ErrorState
            icon={
              <Image
                src="/graphic-icons/database-error.webp"
                alt=""
                width={100}
                height={100}
                className="size-25"
              />
            }
            title="서버와 연결할 수 없습니다"
            description="잠시 후 다시 시도해 주세요"
            action={
              <FloatingButton icon="refresh" onClick={reset}>
                서버 확인 및 재시도
              </FloatingButton>
            }
          />
        </div>
      </body>
    </html>
  );
}
