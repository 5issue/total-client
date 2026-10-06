import type { Metadata } from 'next';

import { MyKurlyHomeView } from '@/components/organisms/mypage/MyKurlyHomeView';

export const metadata: Metadata = { title: '마이컬리' };

/**
 * 마이컬리 홈 (`/mypage`, issue #106). `(shop)` 셸(헤더·BottomNav 마이컬리 활성) 안.
 * 로그아웃 상태로 접근하면 미들웨어가 `/login?redirect=` 로 보낸다(쿠키 낙관 검사).
 */
export default function MyKurlyHomePage() {
  return <MyKurlyHomeView />;
}
