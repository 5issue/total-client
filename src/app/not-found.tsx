'use client';

import { useRouter } from 'next/navigation';

import { FloatingButton } from '@/components/atoms/FloatingButton';
import { FullScreenErrorState } from '@/components/molecules/shared/FullScreenErrorState';

/** 전역 404 — Figma 665-59840. 매칭되는 라우트가 없거나 `notFound()` 호출 시 표시된다. */
export default function NotFound() {
  const router = useRouter();

  return (
    <FullScreenErrorState
      illustration="document-error"
      title="페이지 없음"
      description="주소를 다시 확인하거나 홈으로 이동해 주세요"
      action={
        <FloatingButton icon="refresh" onClick={() => router.push('/')}>
          홈으로 돌아가기
        </FloatingButton>
      }
    />
  );
}
