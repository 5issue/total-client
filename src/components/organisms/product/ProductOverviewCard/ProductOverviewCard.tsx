import { Icon } from '@/components/atoms/Icon';
import {
  ProductDeliveryInfo,
  type ProductDeliveryInfoProps,
} from '@/components/molecules/product/ProductDeliveryInfo';

/**
 * "풀무원" 옆 화살표 전용 — `atoms/Icon` 의 `right-small`(10x16)은 `themable: false`
 * 로 스트로크가 흰색 고정이다(Icon.stories.tsx FIXED_WHITE_ICONS, HeroBanner 의 어두운
 * 배경 위 흰 화살표 전용 에셋). 여기는 밝은 배경 위 회색(`text-fg-tertiary`) 화살표라
 * 재사용할 수 없어, 같은 path 를 `stroke="currentColor"` 로 직접 인라인한다(Figma 원본
 * SVG 그대로, 좌우 정사각형 강제도 없어 10x16 비율이 안 찌그러진다 — `Icon` 은 `size`
 * 하나로 width/height 를 동일하게 그려 비정사각 아이콘에 쓰면 찌그러진다).
 */
function ShippingChevron() {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden>
      <path
        d="M3 12L7 8.0912L3.1384 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 상품 상세 개요 카드 (organism). Figma "5팀 UI 공유용" `ProductOverviewCard`
 * (node 665:43039) — 대표 이미지 바로 아래, 브랜드/배송 태그·상품명·가격·배송 정보를
 * 한 카드로 묶는다.
 *
 * 후기 건수는 Figma 상 절대좌표지만 브랜드 태그 줄과 한 flex 행을 이루는 구조라
 * `justify-between` 로 재구성했다. 공유 버튼은 디자인 확인 결과(코멘트 피드백)
 * Figma 실측 그대로 `absolute top-8.75 right-4.25`(35px/17px, 카드 패딩 엣지 기준) —
 * 상품명 줄과 한 flex 행이 아니라 헤더 블록 전체에 겹쳐진 고정 위치라 absolute 가 맞다.
 *
 * 가격 숫자는 `font-numeric`(SF Pro) — "원" 접미사는 컴포넌트가 붙인다(ProductCard 관례).
 * 후기 건수 클릭(후기 탭 이동)·공유는 이번 이슈 범위 밖이라 핸들러 미전달 시 비상호작용
 * 텍스트/아이콘으로만 렌더한다.
 */
export type ProductOverviewCardProps = {
  brandLabel: string;
  /** 배송타입·판매자 등 부가 태그(예: " · 샛별배송  · 풀무원"). */
  shippingInfo: string;
  name: string;
  subCopy?: string;
  origin: string;
  reviewCountLabel: string;
  onReviewClick?: () => void;
  onShare?: () => void;
  /** 할인율(예: "25%"). 있으면 정가 취소선 가격과 함께 렌더. */
  discountRate?: string;
  /** 정가 숫자만(예: "3,400"). */
  originalPriceLabel?: string;
  /** 판매가 숫자만(예: "2,780"). */
  priceLabel: string;
  /** 첫구매 혜택가 숫자만(예: "1,390"). 있으면 브랜드 컬러로 별도 행 렌더. */
  specialPriceLabel?: string;
  specialPriceNote?: string;
  deliveryRows: ProductDeliveryInfoProps[];
  className?: string;
};

export function ProductOverviewCard({
  brandLabel,
  shippingInfo,
  name,
  subCopy,
  origin,
  reviewCountLabel,
  onReviewClick,
  onShare,
  discountRate,
  originalPriceLabel,
  priceLabel,
  specialPriceLabel,
  specialPriceNote,
  deliveryRows,
  className,
}: ProductOverviewCardProps) {
  return (
    <div
      className={['bg-surface flex w-full flex-col gap-3.5 py-5', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="relative flex flex-col gap-1 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="text-fg-tertiary flex items-center">
            {/* SF Pro(font-numeric) + Extra_Bold 800 — 표준 label 스케일엔 없는
                워드마크 전용 스타일. line-height 20px 는 Tailwind 코어 leading-5 와
                정확히 일치. letter-spacing 1px(Figma Letter_Spacing/L)은 프로젝트
                tracking 스케일에 정확히 대응하는 값이 없어 가장 가까운
                tracking-widest(0.1em≈1.2px)로 근사. */}
            <span className="text-caption-l font-numeric text-primary leading-5 font-extrabold tracking-widest">
              {brandLabel}
            </span>
            <span className="text-label-l">{shippingInfo}</span>
            <ShippingChevron />
          </div>
          {onReviewClick ? (
            <button
              type="button"
              onClick={onReviewClick}
              className="text-caption-l text-fg shrink-0 underline"
            >
              {reviewCountLabel}
            </button>
          ) : (
            <span className="text-caption-l text-fg shrink-0 underline">{reviewCountLabel}</span>
          )}
        </div>

        {/* h1 이 아니다 — 페이지 h1 은 이미 SectionHeader 의 title(같은 상품명, structure §6-1 셸
            헤더)이 맡는다. 한 페이지 h1 하나 원칙(code-style §5). */}
        <p className="text-heading-1 text-fg truncate pr-8">{name}</p>
        {onShare ? (
          <button
            type="button"
            onClick={onShare}
            aria-label="상품 공유하기"
            className="absolute top-8.75 right-4.25 size-6"
          >
            <Icon name="share" size={24} aria-hidden />
          </button>
        ) : (
          <Icon
            name="share"
            size={24}
            aria-hidden
            className="text-fg absolute top-8.75 right-4.25 size-6"
          />
        )}

        {subCopy ? <p className="text-label-m text-fg-quaternary">{subCopy}</p> : null}
        <p className="text-label-m text-fg">{origin}</p>

        {discountRate || originalPriceLabel ? (
          <div className="flex items-end gap-0.5">
            {discountRate ? (
              <span className="text-numeric-l font-numeric text-orange">{discountRate}</span>
            ) : null}
            {originalPriceLabel ? (
              <span className="text-caption-m font-numeric text-fg-quaternary">
                {originalPriceLabel}원
              </span>
            ) : null}
          </div>
        ) : null}

        <p className="text-fg font-numeric flex items-end">
          <span className="text-numeric-xxl">{priceLabel}</span>
          <span className="text-numeric-l">원</span>
        </p>

        {specialPriceLabel ? (
          <div className="flex items-end gap-1.5">
            <p className="text-primary font-numeric flex items-end">
              <span className="text-numeric-xxl">{specialPriceLabel}</span>
              <span className="text-numeric-l">원</span>
            </p>
            {specialPriceNote ? (
              <span className="text-label-m text-primary flex items-center">
                {specialPriceNote}
                {/* caret-down(채워진 삼각형)이 아니라 arrow-down(얇은 스트로크 셰브런) —
                    디자인 시스템 노드 2751:2256 실측(stroke #690085=text-primary,
                    strokeWidth 1.5) 확인, path 가 기존 아이콘셋의 arrow-down-20 과 동일. */}
                <Icon name="arrow-down" size={20} aria-hidden />
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="border-border border-t" />

      <div className="flex flex-col gap-2 px-4">
        {deliveryRows.map((row) => (
          <ProductDeliveryInfo key={row.label} {...row} />
        ))}
      </div>
    </div>
  );
}
