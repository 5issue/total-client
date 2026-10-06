'use client';

import { useState, type UIEvent } from 'react';

import { useRouter } from 'next/navigation';

import { GraphicIcon } from '@/components/atoms/GraphicIcon';
import { ScrollIndicator, type ScrollIndicatorPosition } from '@/components/atoms/ScrollIndicator';
import {
  QuickMenuItem,
  type QuickMenuItemIconName,
} from '@/components/molecules/home/QuickMenuItem';
import type { HomeQuickMenu } from '@/types/home';

/**
 * 홈 퀵메뉴 섹션 — 프로모션 아이콘 2행×11개, 가로 스크롤 + 스크롤 인디케이터
 * (organism). Figma "HomeScreen" > "Section" (node 577:20653).
 *
 * `molecules/home/QuickMenuItem`(아이콘+라벨+N배지)와 `atoms/ScrollIndicator`
 * (3단계 좌/중/우 인디케이터, Figma 상 동일 "Indicator/Scroll_Bar" 컴포넌트)를
 * 그대로 재사용한다.
 *
 * "8월신상품" 한 항목만 `QuickMenuItemIconName` 목록에 없는 "SHOW CASE" 그래픽을
 * 쓴다 — `atoms/GraphicIcon`(name="showcase")이 이미 같은 44px 배경-베이크드 규격의
 * 동일 asset을 갖고 있어 그대로 재사용하고, 이 한 항목만 QuickMenuItem 대신 직접
 * 조립한다(새 webp 에셋을 만들지 않기 위함).
 *
 * `#136` 홈 API 연동: 백엔드(`HomeLayoutProvider`)는 퀵메뉴를 4개(신상품/베스트/
 * 알뜰쇼핑/특가혜택)만 준다 — Figma 22개 목업보다 훨씬 적다. 사용자 확정(이슈 #136
 * 논의) 대로 레이아웃(2행×11개, `ScrollIndicator`)은 그대로 유지하고, `ROW_1`의 앞
 * 4자리만 실 데이터로 교체한다. 5번째 이후(추석선물/패션/placeholder 5개)와 `ROW_2`
 * 11개는 백엔드가 해당 콘텐츠를 아직 안 줘서 기존 mock 그대로 둔다.
 *
 * 백엔드가 주는 `imageUrl`(`/images/quickmenu/*.png`)은 이 경로를 서빙하는 정적
 * 리소스가 백엔드에 없어(product-service 소스 확인) 실제로 로드되지 않는
 * placeholder다 — 그래서 이미지는 쓰지 않고, `linkUrl`의 `sort` 쿼리로 기존
 * 아이콘 세트 중 의미가 가장 가까운 것을 골라 쓴다(placeholder 항목들이 이미
 * 실제 자산 없이 근사 아이콘을 재사용하는 것과 같은 관례).
 */
type QuickMenuData = {
  id: string;
  icon: QuickMenuItemIconName;
  label: string;
  isNew?: boolean;
  /** 있으면 클릭 시 이 경로로 이동한다(API 로 받은 실 항목만 해당). */
  href?: string;
};

const QUICK_MENU_ICON_BY_SORT: Record<string, QuickMenuItemIconName> = {
  LATEST: 'event-default',
  BEST: 'badge-discount',
  SALE: 'price-drop',
  DEAL: 'coupon-discount',
};

function resolveQuickMenuIcon(linkUrl: string): QuickMenuItemIconName {
  const sort = new URLSearchParams(linkUrl.split('?')[1] ?? '').get('sort');
  return (sort && QUICK_MENU_ICON_BY_SORT[sort]) || 'event-default';
}

/** `ROW_1`의 5번째 이후 — 백엔드가 아직 안 주는 항목이라 mock 유지. */
const ROW_1_REST: QuickMenuData[] = [
  { id: 'chuseok-gift', icon: 'gift-lucky', label: '추석선물', isNew: true },
  { id: 'fashion', icon: 'category-fashion', label: '패션' },
  { id: 'row1-placeholder-1', icon: 'category-fashion', label: '첫구매혜택' },
  { id: 'row1-placeholder-2', icon: 'category-fashion', label: '첫구매혜택' },
  { id: 'row1-placeholder-3', icon: 'category-fashion', label: '첫구매혜택' },
  { id: 'row1-placeholder-4', icon: 'category-fashion', label: '첫구매혜택' },
  { id: 'row1-placeholder-5', icon: 'category-fashion', label: '첫구매혜택' },
];

const ROW_2: QuickMenuData[] = [
  { id: 'kurly-members', icon: 'coupon-special', label: '컬리멤버스' },
  { id: 'daily-benefit', icon: 'point-rewards', label: '매일혜택' },
  { id: 'lucky-checkin', icon: 'clover-benefit', label: '행운출첵' },
  { id: 'meal-report', icon: 'category-recipe', label: '식단리포트', isNew: true },
  { id: 'event', icon: 'event-calendar', label: '이벤트' },
  { id: 'row2-placeholder-1', icon: 'category-fashion', label: '첫구매혜택' },
  { id: 'row2-placeholder-2', icon: 'category-fashion', label: '첫구매혜택' },
  { id: 'row2-placeholder-3', icon: 'category-fashion', label: '첫구매혜택' },
  { id: 'row2-placeholder-4', icon: 'category-fashion', label: '첫구매혜택' },
  { id: 'row2-placeholder-5', icon: 'category-fashion', label: '첫구매혜택' },
];

export type QuickMenuSectionProps = {
  /** 홈 API(`home-recommendations`)의 `QUICK_MENU` 섹션 값. */
  quickMenus: HomeQuickMenu[];
  className?: string;
};

export function QuickMenuSection({ quickMenus, className }: QuickMenuSectionProps) {
  const [scrollPosition, setScrollPosition] = useState<ScrollIndicatorPosition>('left');
  const router = useRouter();

  const liveItems: QuickMenuData[] = quickMenus.slice(0, 4).map((item) => ({
    id: `live-${item.linkUrl}`,
    icon: resolveQuickMenuIcon(item.linkUrl),
    label: item.title,
    href: item.linkUrl,
  }));
  const row1 = [...liveItems, ...ROW_1_REST];

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const el = event.currentTarget;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;
    const ratio = el.scrollLeft / maxScroll;
    setScrollPosition(ratio < 1 / 3 ? 'left' : ratio > 2 / 3 ? 'right' : 'center');
  }

  return (
    <section
      className={['flex flex-col items-center gap-3 py-3', className].filter(Boolean).join(' ')}
    >
      {/* SwipeTabShell 의 전역 좌우 스와이프(하단 탭 전환)와 충돌하지 않도록 터치 버블링을 끊는다 — TabBar 참고.
          각 Row 는 w-fit 필수 — 없으면 부모 flex-col 의 align-items:stretch 기본값 때문에
          Row 자신의 박스가 스크롤 컨테이너 폭(뷰포트)까지로 눌려서, 내용이 그 박스를 넘쳐도
          Row 의 px-4 오른쪽 패딩이 실제 마지막 아이템 뒤가 아니라 눌린 박스 오른쪽에 붙어버려
          마지막 아이템 뒤 여백이 사라진다(실기기 확인). w-fit 으로 Row 를 내용 폭만큼 키우면
          패딩이 진짜 마지막 아이템 뒤에 온다. */}
      <div
        onScroll={handleScroll}
        onTouchStart={(event) => event.stopPropagation()}
        onTouchEnd={(event) => event.stopPropagation()}
        className="scrollbar-hide flex w-full flex-col gap-1 overflow-x-auto"
      >
        <div className="flex w-fit items-center gap-2 px-4">
          {row1.map((item) => (
            <QuickMenuItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isNew={item.isNew}
              onClick={item.href ? () => router.push(item.href!) : undefined}
            />
          ))}
        </div>
        <div className="flex w-fit items-center gap-2 px-4">
          <QuickMenuItem icon={ROW_2[0]!.icon} label={ROW_2[0]!.label} isNew={ROW_2[0]!.isNew} />
          <div className="relative flex w-13.75 shrink-0 flex-col items-center justify-center gap-1 py-1">
            <GraphicIcon name="showcase" size={44} aria-hidden />
            <span className="text-caption-m text-fg-secondary text-center whitespace-nowrap">
              8월신상품
            </span>
          </div>
          {ROW_2.slice(1).map((item) => (
            <QuickMenuItem key={item.id} icon={item.icon} label={item.label} isNew={item.isNew} />
          ))}
        </div>
      </div>

      <ScrollIndicator position={scrollPosition} aria-label="퀵메뉴 가로 스크롤 위치" />
    </section>
  );
}
