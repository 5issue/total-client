'use client';

import type { CSSProperties } from 'react';

import { Button } from '@/components/atoms/Button';
import { IconButton } from '@/components/atoms/IconButton';
import { PromotionBar } from '@/components/molecules/shared/PromotionBar';

/**
 * 장바구니 담기 바텀시트 하단 액션 행 — 혜택 배너 + 찜/신선구독/장바구니담기 버튼 +
 * 약관 고지 (molecule). Figma "5팀 디자인 시스템" > `CTA_Horizontal`(node 2490:1454,
 * 실 사용은 2888:2738 "BottomSheet" 안의 인스턴스).
 *
 * 찜 버튼은 `atoms/IconButton`(size="l"=56px, variant="outlineBlack")을 그대로
 * 재사용 — 하트 채움 프리뷰(`activeIcon`)도 이미 이 용도로 설계돼 있다.
 *
 * 찜 상태(`liked`) 색은 `Brand/Medium`(#c16edd = brand-300, Figma 인스펙터로 직접
 * 확인). `heart` 아이콘(빈 하트)은 `fill="currentColor"`라 `text-*`/`color` 로 바뀌지만,
 * `heart-filled`(채운 하트)는 `themable: false` — SVG 안에 `fill="var(--color-brand-500)"`
 * 로 브랜드 프라이머리가 하드코딩돼 있어 버튼의 `color`/`text-*` 를 아무리 바꿔도 안 먹는다
 * (한 번 `style={{ color: ... }}` 로 시도했다가 실제로는 안 바뀌는 걸 실기기에서 확인).
 * 대신 이 SVG 가 참조하는 CSS 커스텀 프로퍼티 `--color-brand-500` 자체를 버튼 DOM
 * 서브트리 안에서만 지역적으로 재정의한다 — CSS 커스텀 프로퍼티는 캐스케이드를 타므로
 * 가장 가까운 조상의 재정의가 이긴다. 아이콘 asset 을 새로 만들거나 icons.generated.tsx
 * 를 고치지 않고 이 지점에서만 안전하게 색을 바꾸는 방법이다.
 *
 * 신선구독/장바구니담기 버튼은 `atoms/Button`(size="l") 재사용 — `size="l"` 은
 * 텍스트(`text-heading-1`=18px/600)가 이 노드 실측과 정확히 일치하고 높이는
 * padding+content 로만 정해져 자체 height 클래스가 없어(비어있음), `className="h-14"`
 * (56px) 오버라이드가 캐스케이드 충돌 없이 안전하게 먹는다(Button.tsx SIZE_HEIGHT_CLASSNAME.l
 * 확인). `showSubscribeButton=false` 면(node 2490:1629, 2831:2424 — 신선구독 불가 상품)
 * 장바구니 담기 버튼이 혼자 전체 폭을 차지한다.
 */
export type AddToCartActionsProps = {
  /** 있으면 상단에 혜택 배너를 렌더한다. */
  promotion?: { text: string; emphasisText: string };
  liked?: boolean;
  onToggleLike?: () => void;
  /** 기본 true. false면 "신선구독" 버튼을 숨기고 담기 버튼이 전체 폭을 차지한다. */
  showSubscribeButton?: boolean;
  onSubscribe?: () => void;
  onAddToCart?: () => void;
  /** 기본 true. 결제 전 약관 고지 문구 노출 여부. */
  showTerms?: boolean;
  className?: string;
};

export function AddToCartActions({
  promotion,
  liked = false,
  onToggleLike,
  showSubscribeButton = true,
  onSubscribe,
  onAddToCart,
  showTerms = true,
  className,
}: AddToCartActionsProps) {
  return (
    <div className={['flex w-full flex-col', className].filter(Boolean).join(' ')}>
      {promotion ? (
        <PromotionBar text={promotion.text} emphasisText={promotion.emphasisText} />
      ) : null}

      <div className="flex flex-col gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <IconButton
            variant="outlineBlack"
            size="l"
            icon={liked ? 'heart-filled' : 'heart'}
            onClick={onToggleLike}
            aria-label={liked ? '찜 해제' : '찜하기'}
            aria-pressed={liked}
            style={
              liked
                ? ({ '--color-brand-500': 'var(--color-brand-300)' } as CSSProperties)
                : undefined
            }
          />
          {showSubscribeButton ? (
            <Button variant="tertiary" size="l" onClick={onSubscribe} className="h-14 flex-1">
              신선구독
            </Button>
          ) : null}
          <Button variant="primary" size="l" onClick={onAddToCart} className="h-14 flex-1">
            장바구니 담기
          </Button>
        </div>

        {showTerms ? (
          <p className="text-caption-m text-fg-tertiary text-center">
            결제 전 <span className="underline">이용약관 및 정보제공</span> 동의를 확인해 주세요
          </p>
        ) : null}
      </div>
    </div>
  );
}
