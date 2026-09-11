'use client';

import { useState } from 'react';

import Link from 'next/link';

import { Icon } from '@/components/atoms/Icon';
import { Logo } from '@/components/atoms/Logo';
import {
  ServiceSwitch,
  type ServiceSwitchOption,
} from '@/components/molecules/shared/ServiceSwitch';

/**
 * 홈 상단 헤더 — 로고 + 마켓컬리/뷰티컬리 서비스 토글 + 알림/장바구니 (organism).
 * Figma "HomeScreen" > "Header" (node 577:20626).
 *
 * 배경 `Brand/Primary`(#690085) 위 흰 잉크 로고(`Logo` name="kurly", 흰 잉크 variant,
 * viewBox 78×44 — Figma 실측과 1:1) + 흰 텍스트 아이콘(themable, `text-fg-inverse`).
 * `organisms/shared/SectionHeader`/`KurlyHeader`는 좌측 고정 로고 레이아웃을 지원하지
 * 않아 재사용하지 못하고 이 조합만 새로 구성했다.
 *
 * 뷰티컬리는 아직 목적지 화면이 없어(기획 미확정) 탭 선택은 컴포넌트 내부 로컬
 * state로만 토글하고 페이지 이동은 없다 — 외부로 끌어올릴 서버/공유 상태가
 * 아니라서 Zustand 로 옮기지 않는다(code-style §3-1). Figma 상 두 탭 다 선택
 * 가능한 표현이라 `disabled` 는 쓰지 않는다(그러면 흰 텍스트 대신 비활성 톤이 돼
 * 스펙과 어긋난다).
 *
 * `pt-[env(safe-area-inset-top)]`: 홈 화면에 추가한 PWA(standalone, iOS)는
 * `apple-mobile-web-app-status-bar-style: black-translucent`(app/layout.tsx)라
 * 상태바가 투명해지고 콘텐츠가 그 아래까지 그려진다. 이 퍼플 배경을 상태바
 * 영역까지 밀어 올려야 Figma 목업(node 2438:1393)처럼 상태바~헤더가 한 덩어리
 * 퍼플로 보인다 — 실제 로고/아이콘 행은 안전영역만큼 아래로 밀려 노치를 피한다.
 */
const SERVICE_OPTIONS: [ServiceSwitchOption, ServiceSwitchOption] = [
  { id: 'market', label: '마켓컬리' },
  { id: 'beauty', label: '뷰티컬리' },
];

export type HomeHeaderProps = {
  /** 장바구니 담긴 상품 개수. 0 이하/미지정이면 뱃지를 숨긴다. */
  cartCount?: number;
  className?: string;
};

export function HomeHeader({ cartCount, className }: HomeHeaderProps) {
  const [activeService, setActiveService] = useState('market');

  return (
    <header
      className={['bg-primary pt-[env(safe-area-inset-top)]', className].filter(Boolean).join(' ')}
    >
      <div className="flex h-[54px] items-center justify-between px-4">
        <Logo name="kurly" height={44} aria-label="Kurly" />

        <ServiceSwitch
          options={SERVICE_OPTIONS}
          activeId={activeService}
          onChange={setActiveService}
        />

        <div className="flex shrink-0 items-center">
          {/* 알림 목적지 화면이 아직 없어 KurlyHeader 와 동일하게 pending(표시만, 비상호작용) 처리 */}
          <span aria-hidden className="flex size-11 items-center justify-center">
            <Icon name="bell" size={28} className="text-fg-inverse" aria-hidden />
          </span>
          <Link
            href="/cart"
            aria-label={cartCount ? `장바구니, 담긴 상품 ${cartCount}개` : '장바구니'}
            className="relative flex size-11 items-center justify-center"
          >
            <Icon name="cart" size={28} className="text-fg-inverse" aria-hidden />
            {cartCount ? (
              <span
                aria-hidden
                className="bg-fg text-fg-inverse absolute top-0 right-0 flex size-5 items-center justify-center rounded-full text-[12px] leading-none font-black"
              >
                {cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
