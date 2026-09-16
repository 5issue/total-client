'use client';

import { useRouter } from 'next/navigation';

import {
  SectionHeader,
  type SectionHeaderAction,
} from '@/components/organisms/shared/SectionHeader';

/**
 * (shop) 상단 헤더 — 뒤로가기 + 마이컬리 로고(좌) + 위치·알림·장바구니(우).
 * Figma "TopNavigationBar"(node 910-110970) — 이 화면 전용 헤더라 좌측에 뒤로가기 화살표가
 * 있고, 아이콘 글리프도 `SectionHeader` 기본값(32, back/close 가시성용으로 키운 값)이 아닌
 * Figma 실측 그대로 28을 쓴다(`iconSize={28}`). 아이콘 크기가 커 보인다는 피드백으로
 * 확인(2026-09-17) — `pending`(위치/알림) 도 마찬가지로 28.
 *
 * 아직 `(shop)/layout.tsx` 에 전역 배치하지 않는다 — 장바구니는 X(닫기)형 `SectionHeader` 라
 * 전역화하면 충돌한다. 헤더가 이 형태로 필요한 페이지(`/login`, `/mypage`)가 직접 조립한다.
 * 위치·알림은 목적지 화면이 아직 없어 아이콘만 노출(`pending`) — 변경은 Figma 코멘트로 통지.
 */
const ACTIONS: SectionHeaderAction[] = [
  { icon: 'location', label: '위치', pending: true },
  { icon: 'bell', label: '알림', pending: true },
  { icon: 'cart', label: '장바구니', href: '/cart' },
];

export function KurlyHeader({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <SectionHeader
      className={className}
      leading="back"
      onLeadingClick={() => router.back()}
      center={<span className="text-heading-0 text-fg">마이컬리</span>}
      actions={ACTIONS}
      iconSize={28}
    />
  );
}
