'use client';

import {
  SectionHeader,
  type SectionHeaderAction,
} from '@/components/organisms/shared/SectionHeader';

/**
 * (shop) 상단 헤더 — 마이컬리 로고(좌) + 위치·알림·장바구니(우). Figma "Indicator/Header Row".
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
  return (
    <SectionHeader
      className={className}
      center={<span className="text-heading-0 text-fg">마이컬리</span>}
      actions={ACTIONS}
    />
  );
}
