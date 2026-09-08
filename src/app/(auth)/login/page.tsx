import type { Metadata } from 'next';

import { SocialLoginPanel } from '@/components/organisms/auth/SocialLoginPanel';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';

export const metadata: Metadata = { title: '로그인' };

/**
 * 로그인 화면 — Figma "5팀 UI 공유용" node 460-8153.
 * 카카오·네이버 소셜 로그인만. 상태바(OS)·하단 네비게이션(별도 담당자)은 구현 범위 밖.
 *
 * 렌더링(structure §2-1): **정적 셸**. 폼이 없어(소셜 전용) 동적 API 를 안 쓰고,
 * 상호작용은 `SocialLoginPanel`(클라 잎) 한 곳에만 있다. "비로그인 전용" 가드는
 * 세션 무음 재발급 배선과 함께 별도(#50).
 *
 * 헤더 우측 아이콘은 목적지 라우트가 있는 장바구니만 배선한다 — 위치/알림 아이콘은
 * 대상 화면이 아직 없어 제외(디자인 코멘트로 통지).
 */
export default function LoginPage() {
  return (
    <>
      <SectionHeader
        center={<span className="text-heading-0 text-fg">마이컬리</span>}
        actions={[{ icon: 'cart', label: '장바구니', href: '/cart' }]}
      />

      <main className="flex flex-1 flex-col px-4">
        <section className="flex flex-col items-center gap-2 pt-36 text-center">
          <h1 className="text-display-xs text-fg">로그인을 해주세요!</h1>
          <p className="text-heading-4 text-fg">컬리의 다양한 혜택들을 받아보실 수 있어요.</p>
        </section>

        <SocialLoginPanel className="mt-auto pb-16" />
      </main>
    </>
  );
}
