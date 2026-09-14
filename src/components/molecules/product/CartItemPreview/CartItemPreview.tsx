'use client';

import Image from 'next/image';

/**
 * 장바구니 담기 바텀시트 상단 — 지금 담으려는 상품 미리보기 (molecule).
 * Figma "5팀 디자인 시스템" > `Item_H_Order`(node 2888:2661), h-60px.
 *
 * `imageSrc` 미지정 시 회색 박스로 대체한다(퍼블리싱 단계 관례, `CartLineItem` 참고).
 */
export type CartItemPreviewProps = {
  imageSrc?: string;
  imageAlt: string;
  name: string;
  /** 짧은 한 줄 소개(예: "가격, 퀄리티 모두 만족스러운 1A등급 우유"). */
  tagline: string;
  className?: string;
};

export function CartItemPreview({
  imageSrc,
  imageAlt,
  name,
  tagline,
  className,
}: CartItemPreviewProps) {
  return (
    <div
      className={['flex h-15 w-full items-center gap-3 px-4', className].filter(Boolean).join(' ')}
    >
      <div className="relative size-12 shrink-0 overflow-hidden rounded-sm">
        {imageSrc ? (
          <Image src={imageSrc} alt={imageAlt} fill sizes="48px" className="object-cover" />
        ) : (
          <div aria-hidden className="bg-surface-secondary absolute inset-0" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-body-m text-fg truncate">{name}</p>
        <p className="text-label-m text-fg-quaternary truncate font-normal">{tagline}</p>
      </div>
    </div>
  );
}
