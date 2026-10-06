'use client';

import { ImageFrameContainer } from '@/components/atoms/ImageFrameContainer';

/**
 * 추천 검색어 1개 — 이미지 프레임 + 라벨 (molecule).
 * Figma "5팀 UI 공유용" node 577-13754 "Image_Container"(atoms/ImageFrameContainer 를
 * 감싸는 상위 컴포지션 — node 194-10029 와 동일 패턴, `atoms/ImageFrameContainer` 주석 참고).
 * 이미지+캡션 조합이라 도메인 지식이 생겨 atom 이 아니라 molecule.
 */
export interface RecommendedKeywordItemProps {
  keyword: string;
  imageSrc: string;
  onClick?: (keyword: string) => void;
  className?: string;
}

export function RecommendedKeywordItem({
  keyword,
  imageSrc,
  onClick,
  className,
}: RecommendedKeywordItemProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(keyword)}
      className={['flex w-14 shrink-0 flex-col items-center gap-1', className]
        .filter(Boolean)
        .join(' ')}
    >
      <ImageFrameContainer src={imageSrc} alt="" />
      <span className="text-caption-m text-fg w-full truncate text-center font-bold">
        {keyword}
      </span>
    </button>
  );
}
