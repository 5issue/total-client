import type { Metadata } from 'next';

import { LoginView } from '@/components/organisms/auth/LoginView';

export const metadata: Metadata = { title: '로그인' };

/**
 * 로그인 화면 (`/login`). `(shop)` 셸(헤더·BottomNav 마이컬리 활성) 안에서 소셜 로그인(Figma 577-13111).
 * 로그아웃 상태로 `/mypage`·`/checkout`·마이컬리 상세에 접근하면 미들웨어가 여기로 보낸다.
 * 세션 분기·헤더 조립은 `LoginView`(클라) — page 는 RSC 유지.
 */
export default function LoginPage() {
  return <LoginView />;
}
