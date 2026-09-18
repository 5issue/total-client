import type { ReactNode } from 'react';

import Image from 'next/image';

import { ErrorState } from '@/components/molecules/shared/ErrorState';

/**
 * 헤더/BottomNav 없이 화면 전체를 차지하는 `ErrorState` (404, 글로벌 에러 등).
 * `not-found.tsx`/`global-error.tsx`처럼 라우트 그룹 밖에서 쓰여 `(auth)/layout.tsx`와
 * 동일한 모바일 폭 프레임을 직접 그린다.
 */
export interface FullScreenErrorStateProps {
  /** `public/graphic-icons/<illustration>.webp` 파일명(확장자 제외). */
  illustration: string;
  title: string;
  description: string;
  action: ReactNode;
}

export function FullScreenErrorState({
  illustration,
  title,
  description,
  action,
}: FullScreenErrorStateProps) {
  return (
    <main className="bg-surface mx-auto flex min-h-dvh max-w-screen-sm flex-col items-center justify-center px-6">
      {/* 페이지 랜드마크/제목 보강용 — 시각적으로는 ErrorState 의 title 문단이 대신한다. */}
      <h1 className="sr-only">{title}</h1>
      <ErrorState
        icon={
          <Image
            src={`/graphic-icons/${illustration}.webp`}
            alt=""
            width={100}
            height={100}
            className="size-25"
          />
        }
        title={title}
        description={description}
        action={action}
      />
    </main>
  );
}
