'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Icon } from '@/components/atoms/Icon';
import { StatusLabel } from '@/components/molecules/shared/StatusLabel';

/**
 * 홈 히어로 배너 — 프로모션 이미지 + 카피 + 자동재생 토글 + 페이지네이션 (organism).
 * Figma "HomeScreen" > "Banner Image" (node 577:20652), 402×298.
 *
 * `04 | 30` 은 카운트다운이 아니라 "전체 30개 배너 중 4번째" 형태의 배너 인덱스
 * 카운터다(역질문으로 확인) — `current`/`total` props 로 받는다.
 *
 * 재생/일시정지 버튼: 디자인 시스템에 Pause 아이콘만 있고 Play 아이콘이 없다
 * (`search_design_system` 확인, 0건) — 아이콘 글리프는 고정하고 `aria-pressed`/
 * `aria-label` 로만 상태를 알린다(역질문으로 확인, 아이콘 추가는 후속).
 *
 * "광고" 뱃지는 `molecules/shared/StatusLabel`(`type="adLabelS"`) 재사용 — 이 화면
 * 전용으로 새로 만들지 않는다.
 *
 * 이번 단계는 배너가 1장(mock)이라 자동재생 타이머로 실제 슬라이드를 넘기지 않는다.
 * `playing` 은 버튼 상태 표시용 로컬 UI 상태일 뿐이라 Zustand 로 옮기지 않는다.
 *
 * `imageSrc` 미지정 시 회색 박스로 대체한다 — `molecules/cart/CartLineItem` 과 동일한
 * 퍼블리싱 단계 관례(실제 상품/배너 이미지는 API 연동 시 교체, 이슈 #61 Image_Frame_Container).
 */
export type HeroBannerProps = {
  imageSrc?: string;
  imageAlt: string;
  /** 상단 얇은 카피 한 줄(예: "오늘만이 가격"). */
  eyebrow: string;
  /** 상단 굵은 카피 한 줄(예: "지금 반값세일 중"). */
  title: string;
  description: string;
  /** "전체보기" 및 페이지네이션 링크 목적지. */
  href: string;
  /** 1-base 현재 배너 순번. */
  current: number;
  /** 전체 배너 개수. */
  total: number;
  className?: string;
};

export function HeroBanner({
  imageSrc,
  imageAlt,
  eyebrow,
  title,
  description,
  href,
  current,
  total,
  className,
}: HeroBannerProps) {
  const [playing, setPlaying] = useState(true);

  return (
    <div
      className={['relative aspect-[402/298] w-full overflow-hidden', className]
        .filter(Boolean)
        .join(' ')}
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="(max-width: 480px) 100vw, 402px"
          className="object-cover"
        />
      ) : (
        <div aria-hidden className="bg-surface-secondary absolute inset-0" />
      )}

      <div className="text-fg relative flex flex-col gap-1 px-6 pt-6">
        <p className="text-display-m">{eyebrow}</p>
        <p className="text-display-l">{title}</p>
        <p className="text-body-s mt-2">{description}</p>
      </div>

      <div className="absolute right-3 bottom-3 flex flex-col items-end gap-3">
        <StatusLabel type="adLabelS">광고</StatusLabel>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPlaying((prev) => !prev)}
            aria-pressed={playing}
            aria-label={playing ? '배너 자동 재생 일시정지' : '배너 자동 재생 시작'}
            className="bg-overlay flex size-7 shrink-0 items-center justify-center rounded-full"
          >
            <Icon name="pause" size={20} aria-hidden />
          </button>

          <Link
            href={href}
            aria-label={`전체보기, 현재 ${current} / 전체 ${total}`}
            className="bg-overlay text-fg-inverse text-caption-m inline-flex h-7 items-center gap-1 rounded-full px-2 whitespace-nowrap"
          >
            <span className="flex items-center gap-0.5">
              <span>{String(current).padStart(2, '0')}</span>
              <span aria-hidden className="h-2 w-px bg-white/60" />
              <span className="text-fg-quaternary">{total}</span>
            </span>
            전체보기
            <Icon name="right-small" size={16} aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
