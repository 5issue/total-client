'use client';

import { useLogout } from '@/hooks/auth/useLogout';

import { LinkSection } from './LinkSection';
import { MOCK_LINK_SECTIONS } from './mock';

const ACCOUNT_SECTION = MOCK_LINK_SECTIONS[MOCK_LINK_SECTIONS.length - 1]!;

/**
 * "계정" 섹션(로그아웃/회원 탈퇴)만 떼어낸 얇은 클라이언트 경계 — `PromoSummarySectionContainer`
 * 와 같은 원칙(#148). "회원 탈퇴"는 아직 목적지 화면이 없어 계속 mock(비상호작용) 그대로
 * 두고, "로그아웃"에만 실제 뮤테이션을 `onClick`으로 얹는다.
 */
export function AccountLinkSectionContainer() {
  const logout = useLogout();

  const links = ACCOUNT_SECTION.links.map((link) =>
    link.label === '로그아웃'
      ? { ...link, onClick: () => !logout.isPending && logout.mutate() }
      : link,
  );

  return <LinkSection section={{ ...ACCOUNT_SECTION, links }} divider={false} className="w-full" />;
}
