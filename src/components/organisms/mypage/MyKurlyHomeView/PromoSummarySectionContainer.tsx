'use client';

import { useUserProfile } from '@/hooks/user/useUserProfile';

import { PromoSummarySection } from './PromoSummarySection';

/**
 * `PromoSummarySection`의 닉네임만 실 데이터로 교체하는 얇은 클라이언트 경계(이슈 #148).
 * `MyKurlyHomeView`는 상호작용 state가 없어 RSC로 유지하기로 한 결정이 있어(#111
 * 코드래빗 리뷰) 이 컨테이너만 따로 뗐다 — `'use client'`를 잎 컴포넌트에만 올리는
 * 원칙(code-style §8) 그대로.
 *
 * `GET /api/v1/users/me/profile`엔 `name`만 있고 적립금/컬리캐시/매일혜택포인트/상품권
 * 필드가 없어(`UserProfileResponse.java` 확인) 그 부분은 계속 mock — 닉네임 하나만
 * 실 데이터로 넘긴다. 로딩·에러 시, 그리고 `name`이 실제로 null인 계정(2026-09-29
 * 실 백엔드 확인)엔 prop을 비워 `PromoSummarySection` 자체의 mock fallback이 그대로
 * 보이게 둔다(다른 화면들의 "생략 시 mock" 관례와 동일).
 */
export function PromoSummarySectionContainer() {
  const { data } = useUserProfile();

  return <PromoSummarySection nickname={data?.name ?? undefined} />;
}
