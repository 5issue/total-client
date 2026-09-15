import type { Metadata } from 'next';

import { KurlyHeader } from '@/components/organisms/shared/KurlyHeader';

export const metadata: Metadata = { title: '마이컬리' };

/**
 * 마이컬리 홈 (`/mypage`, 구현 예정). `(shop)` 셸(헤더·BottomNav 마이컬리 활성) 안.
 * 로그아웃 상태로 접근하면 미들웨어가 `/login?redirect=` 로 보낸다(쿠키 낙관 검사).
 */
export default function MyKurlyHomePage() {
  return (
    <>
      <KurlyHeader />
      <div className="text-label-m text-fg-tertiary p-4">마이컬리 홈 (구현 예정)</div>
    </>
  );
}
