import type { NextRequest } from 'next/server';

import { proxySpringAddress } from '@/lib/address/springProxy';
import { UserProfileResponseSchema } from '@/types/user';

// user-service 소유, 배송지(`/api/addresses`)와 같은 서비스·같은 인증 방식이라
// 기존 `proxySpringAddress`를 그대로 재사용한다(이슈 #148 — 새 도메인마다 프록시
// 함수를 복제하지 않는다, springProxy.ts 자체 주석의 "도메인 늘어나면 공용화 검토" 참고).
const PROFILE_PATH = '/api/v1/users/me/profile';

/** 마이컬리 홈 인사말(닉네임)에 쓰는 회원 이름 조회. */
export async function GET(req: NextRequest) {
  return proxySpringAddress(req, PROFILE_PATH, UserProfileResponseSchema, {
    method: 'GET',
    failureMessage: '회원 정보를 불러오는 중 오류가 발생했습니다.',
  });
}
