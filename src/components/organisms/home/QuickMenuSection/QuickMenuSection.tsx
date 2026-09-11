'use client';

import { useState, type UIEvent } from 'react';

import { GraphicIcon } from '@/components/atoms/GraphicIcon';
import { ScrollIndicator, type ScrollIndicatorPosition } from '@/components/atoms/ScrollIndicator';
import {
  QuickMenuItem,
  type QuickMenuItemIconName,
} from '@/components/molecules/home/QuickMenuItem';

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
 * Figma 원본에 11개 항목 중 뒤쪽 5~6개가 "첫구매혜택" 라벨 + 동일 아이콘으로
 * 그대로 복제돼 있다(placeholder로 보임) — 실제 스펙 그대로 옮기고, 확정 카피는
 * 디자인팀 Figma 코멘트로 갱신되면 그때 교체한다(structure-convention §6-1).
 */
type QuickMenuData = {
  id: string;
  icon: QuickMenuItemIconName;
  label: string;
  isNew?: boolean;
};

const ROW_1: QuickMenuData[] = [
  { id: 'first-purchase', icon: 'coupon-discount', label: '첫구매혜택' },
  { id: 'kurly-only', icon: 'kurly-only', label: '단독특가' },
  { id: 'lowest-price', icon: 'badge-discount', label: '최저가도전' },
  { id: 'members-deal', icon: 'price-drop', label: '멤버스특가' },
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
  className?: string;
};

export function QuickMenuSection({ className }: QuickMenuSectionProps) {
  const [scrollPosition, setScrollPosition] = useState<ScrollIndicatorPosition>('left');

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
      {/* SwipeTabShell 의 전역 좌우 스와이프(하단 탭 전환)와 충돌하지 않도록 터치 버블링을 끊는다 — TabBar 참고 */}
      <div
        onScroll={handleScroll}
        onTouchStart={(event) => event.stopPropagation()}
        onTouchEnd={(event) => event.stopPropagation()}
        className="flex w-full flex-col gap-1 overflow-x-auto"
      >
        <div className="flex items-center gap-2 px-4">
          {ROW_1.map((item) => (
            <QuickMenuItem key={item.id} icon={item.icon} label={item.label} isNew={item.isNew} />
          ))}
        </div>
        <div className="flex items-center gap-2 px-4">
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
