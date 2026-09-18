'use client';

import { useRouter } from 'next/navigation';

import { ThemeToggle } from '@/components/molecules/shared/ThemeToggle';
import {
  SectionHeader,
  type SectionHeaderAction,
} from '@/components/organisms/shared/SectionHeader';

/**
 * (shop) 상단 헤더 — 뒤로가기 + 마이컬리 로고(좌) + (선택) 다크모드 토글·위치·장바구니(우).
 * Figma "TopNavigationBar"(node 910-110970 라이트 / 1691-205512 다크, 2026-09-18 재확인)
 * — 아이콘 글리프는 `SectionHeader` 기본값(28, Figma 실측)을 그대로 쓴다.
 *
 * 다크모드 토글은 `showThemeToggle` 이 true 일 때만 렌더한다 — 다크가 지금 마이컬리
 * 화면 서브트리로만 스코프돼 있어(`ThemeScope`, 2026-09-18 "우선 마이컬리만" 결정),
 * 이 헤더를 공유하는 `/login` 등 다른 화면에 토글을 노출하면 눌러도 아무 효과가 없어
 * 보이는 죽은 컨트롤이 된다 — `MyKurlyHomeView` 만 true 로 켠다.
 *
 * 알림(bell) 아이콘은 최신 스펙에서 빠졌다 — 이전엔 있었지만 재확인 결과 제거됨
 * (리뷰 피드백, 2026-09-18). 장바구니 배지 `4`는 `HomeHeader cartCount={4}` 와 같은
 * 목업값(API 연동 전) — 실제 카트 수량 연동 시 여기 한 곳만 바꾸면 된다.
 *
 * 아직 `(shop)/layout.tsx` 에 전역 배치하지 않는다 — 장바구니는 X(닫기)형 `SectionHeader` 라
 * 전역화하면 충돌한다. 헤더가 필요한 페이지(`/login`, `/mypage`)가 직접 조립한다.
 * 위치는 목적지 화면이 아직 없어 아이콘만 노출(`pending`).
 */
const ACTIONS: SectionHeaderAction[] = [
  { icon: 'location', label: '위치', pending: true },
  { icon: 'cart', label: '장바구니', href: '/cart', badge: 4 },
];

export function KurlyHeader({
  className,
  showThemeToggle = false,
}: {
  className?: string;
  showThemeToggle?: boolean;
}) {
  const router = useRouter();

  return (
    <SectionHeader
      className={className}
      leading="back"
      onLeadingClick={() => router.back()}
      center={<span className="text-heading-0 text-fg">마이컬리</span>}
      extra={showThemeToggle ? <ThemeToggle className="mr-2" /> : null}
      actions={ACTIONS}
    />
  );
}
