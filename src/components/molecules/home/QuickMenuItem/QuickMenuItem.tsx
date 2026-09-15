'use client';

import Image from 'next/image';

import { Icon } from '@/components/atoms/Icon/Icon';

/**
 * 홈 프로모션 퀵메뉴 아이템 (Figma "Quick_Menu_Item", node 2429-2807).
 * `public/graphic-icons/*.webp` 는 배경 박스(Surface/Overlay_blue, rounded)까지
 * 이미 구워진(baked-in) 44px 완성 그래픽이라 별도 배경/라운딩을 씌우지 않는다
 * (실측: 파일 자체가 44px 기준 3배율 export, 가장자리 알파가 이미 overlay_blue 톤).
 * 라벨 + 선택적 "N"(신규) 배지. 일반 유틸리티 퀵메뉴(쿠폰/주문내역 등)는 QuickMenu 를 쓴다.
 *
 * `shrink-0` 필수 — 가로 스크롤 flex row(`QuickMenuSection`) 안에서 라벨 길이가 짧은
 * 항목("패션", "이벤트" 등)이 flex-shrink 기본값(1) 때문에 44px 아이콘 너비까지
 * 눌려 다른 항목과 폭/간격이 들쭉날쭉해지는 문제가 있었다(실기기 확인).
 */
export type QuickMenuItemIconName =
  | 'badge-discount'
  | 'category-fashion'
  | 'category-recipe'
  | 'clover-benefit'
  | 'coupon-discount'
  | 'coupon-special'
  | 'event-attendance'
  | 'event-calendar'
  | 'event-default'
  | 'event-point'
  | 'gift-lucky'
  | 'kurly-only'
  | 'point-rewards'
  | 'price-drop';

export type QuickMenuItemProps = {
  icon: QuickMenuItemIconName;
  label: string;
  isNew?: boolean;
  onClick?: () => void;
  className?: string;
};

export function QuickMenuItem({
  icon,
  label,
  isNew = false,
  onClick,
  className,
}: QuickMenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'relative flex w-13.75 shrink-0 flex-col items-center justify-center gap-1 py-1',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Image src={`/graphic-icons/${icon}.webp`} alt="" width={44} height={44} />
      <span className="text-caption-m text-fg-secondary text-center whitespace-nowrap">
        {label}
      </span>
      {isNew && <Icon name="new" size={14} aria-hidden className="absolute top-0 left-10.5" />}
    </button>
  );
}
