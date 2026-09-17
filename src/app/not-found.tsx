'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { FloatingButton } from '@/components/atoms/FloatingButton';
import { ErrorState } from '@/components/molecules/shared/ErrorState';

/**
 * 전역 404 — Figma 665-59840. 잘못된 URL 접근·만료된 딥링크/알림 클릭 시 표시된다.
 * `(shop)` 라우트 그룹 밖(주소 자체가 매칭되지 않음)이라 BottomNav/헤더 없이
 * `(auth)/layout.tsx` 와 동일한 모바일 폭 프레임만 직접 재사용한다.
 */
export default function NotFound() {
  const router = useRouter();

  return (
    <div className="bg-surface mx-auto flex min-h-dvh max-w-screen-sm flex-col items-center justify-center px-6">
      <ErrorState
        icon={
          <Image
            src="/graphic-icons/document-error.webp"
            alt=""
            width={100}
            height={100}
            className="size-25"
          />
        }
        title="페이지 없음"
        description="주소를 다시 확인하거나 홈으로 이동해 주세요"
        action={
          <FloatingButton icon="refresh" onClick={() => router.push('/')}>
            홈으로 돌아가기
          </FloatingButton>
        }
      />
    </div>
  );
}
