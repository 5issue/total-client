import Image from 'next/image';

/**
 * 순수 이미지 프레임 (Figma "Image_Frame_Container", node 2529-7531 등 —
 * `Food=` variant 는 전부 이미지 소스만 다른 동일 컴포넌트).
 * AI 추천 키워드 등에서 재사용하는 56×56 정사각 프레임. 로고/텍스트 없이
 * 이미지만 담당하므로 도메인 지식이 없어 atom 으로 분류.
 *
 * radius(18px)는 기존 `--radius-xxl` 토큰 재사용(node 3215-3217 에서 이미 추출된 값과 동일).
 * 로드 전 배경(`bg-surface-secondary`)으로 레이아웃 시프트를 막는다(structure-convention §5).
 */
export interface ImageFrameContainerProps {
  src: string;
  /** 장식용이 아니므로 항상 의미 있는 대체 텍스트가 필요하다(예: 상품/키워드명). */
  alt: string;
  className?: string;
}

export function ImageFrameContainer({ src, alt, className }: ImageFrameContainerProps) {
  return (
    <div
      className={[
        'bg-surface-secondary rounded-xxl relative aspect-square w-14 shrink-0 overflow-hidden',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Image src={src} alt={alt} fill sizes="56px" className="object-cover" />
    </div>
  );
}
