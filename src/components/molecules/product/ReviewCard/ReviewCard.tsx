'use client';

import { useState } from 'react';

import type { BadgeProps } from '@/components/atoms/Badge';
import { HelpfulVoteChip } from '@/components/atoms/HelpfulVoteChip';
import { ReviewerBadge } from '@/components/molecules/product/ReviewerBadge';

/**
 * 후기 목록의 리뷰 한 건 (molecule). Figma "5팀 UI 공유용" `Review_Info_Card`
 * (node 665:43660 등, 8건 반복) — 작성자 뱃지/상품명/리뷰 사진(최대 4장)/본문/
 * 작성일/도움돼요 칩.
 *
 * 리뷰 사진은 백엔드 제공 전까지 회색 박스(다른 이미지 슬롯과 동일 관례).
 * 본문(`reviewLines`)은 Figma 상 문단이 `<p class="mb-0">` 반복이거나 `<br/>` 줄바꿈,
 * 혹은 줄바꿈 없는 단일 문단으로 카드마다 제각각인데, 셋 다 같은 줄간격(20px)이라
 * 문자열 배열 하나로 통일해 받아 `<p>` 를 그대로 반복해도 시각적으로 동일하다.
 *
 * "도움돼요" 칩은 `HelpfulVoteChip` 자체가 Default/Selected 상태를 이미 갖고 있어
 * (node 3235-4355 외) 로컬 토글로 카운트를 ±1 한다 — 서버 연동 전 목 데이터 단계라
 * `liked`(AddToCartActions)와 같은 원칙의 순수 클라 UI 상태.
 */
export type ReviewCardProps = {
  badges?: BadgeProps[];
  username: string;
  productName: string;
  imageCount?: number;
  reviewLines: string[];
  date: string;
  helpfulCount: number;
  className?: string;
};

const DEFAULT_IMAGE_COUNT = 4;

export function ReviewCard({
  badges,
  username,
  productName,
  imageCount = DEFAULT_IMAGE_COUNT,
  reviewLines,
  date,
  helpfulCount,
  className,
}: ReviewCardProps) {
  const [selected, setSelected] = useState(false);
  const displayedCount = helpfulCount + (selected ? 1 : 0);

  return (
    <div
      className={['bg-surface flex w-full flex-col gap-4 px-4 py-3', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex w-full flex-col items-start gap-2">
        <ReviewerBadge badges={badges} username={username} />
        <p className="text-caption-m text-fg-secondary w-full">{productName}</p>
        <div className="rounded-m flex items-center gap-1 overflow-hidden">
          {Array.from({ length: Math.min(imageCount, DEFAULT_IMAGE_COUNT) }, (_, i) => (
            <div key={i} aria-hidden className="bg-surface-secondary size-21 shrink-0" />
          ))}
        </div>
        {/* 디자인 QA(#132): 두꺼워보임 — text-label-l 기본 weight(600/SemiBold)에서
            100 낮춰 500(Medium)으로. */}
        <div className="text-label-l text-fg w-full font-medium!">
          {reviewLines.map((line, i) => (
            <p key={i} className={i < reviewLines.length - 1 ? 'mb-0' : undefined}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <div className="flex w-full items-center justify-between">
        <p className="text-caption-m text-fg-tertiary">{date}</p>
        <HelpfulVoteChip
          selected={selected}
          count={displayedCount}
          onClick={() => setSelected((prev) => !prev)}
        />
      </div>
    </div>
  );
}
