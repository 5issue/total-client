'use client';

import { Icon } from '@/components/atoms/Icon/Icon';
import { Logo } from '@/components/atoms/Logo/Logo';

/**
 * AI 채팅의 키워드/식단 선택 카드 (Figma "Recommended_Keywords_Container",
 * node 2674-4482 / 2683-4991 — 동일 구조에 카피만 다름).
 * 그라데이션(Secondary/Blue → Brand/Light, 113deg)은 재사용 가치가 낮은
 * 일회성 배경이라 토큰화하지 않고 인라인 style 로 둔다(기본색 2개만 토큰화:
 * --color-blue, 기존 --color-brand-200).
 */
export type RecommendedKeywordsContainerProps = {
  title: string;
  description: string;
  promptLabel: string;
  keywords: string[];
  onSelectKeyword?: (keyword: string) => void;
  /** 제공하면 "다시 추천 받기" 칩을 보여준다. */
  onReset?: () => void;
  className?: string;
};

export function RecommendedKeywordsContainer({
  title,
  description,
  promptLabel,
  keywords,
  onSelectKeyword,
  onReset,
  className,
}: RecommendedKeywordsContainerProps) {
  return (
    <div
      className={['flex w-full flex-col gap-3 px-4 pt-5 pb-3', className].filter(Boolean).join(' ')}
      style={{
        backgroundImage:
          'linear-gradient(113deg, color-mix(in srgb, var(--color-blue) 40%, transparent) 0%, color-mix(in srgb, var(--color-brand-200) 40%, transparent) 100%)',
      }}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <Logo name="chat-kurly-2" height={32} aria-hidden />
          <p className="text-heading-1 text-fg flex-1">{title}</p>
        </div>
        <p className="text-label-m text-fg">{description}</p>
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-label-xl text-fg">{promptLabel}</p>
        <div className="flex items-center gap-1 overflow-x-auto">
          {keywords.map((keyword) => (
            <button
              key={keyword}
              type="button"
              onClick={() => onSelectKeyword?.(keyword)}
              className="text-label-xs text-fg bg-surface h-8 shrink-0 rounded-full px-4 py-1 whitespace-nowrap"
            >
              {keyword}
            </button>
          ))}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="text-label-xs text-primary border-primary flex h-8 shrink-0 items-center gap-1 rounded-full border px-4 whitespace-nowrap"
            >
              다시 추천 받기
              <Icon name="refresh" size={20} aria-hidden />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
