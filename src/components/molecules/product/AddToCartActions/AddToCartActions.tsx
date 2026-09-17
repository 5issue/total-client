'use client';

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
 * 확인). `heart-filled`(채운 하트)는 `themable: false` — SVG 안에 이미
 * `fill="var(--color-brand-500)"` 가 박혀 있어 버튼의 `color`/`text-*` 로는 안 바뀐다.
 * `[--color-brand-500:var(--color-brand-300)]` 로 그 커스텀 프로퍼티 자체를 버튼
 * 서브트리 안에서만 지역 재정의한다(캐스케이드로 가장 가까운 조상이 이김) — 아이콘
 * asset 이나 icons.generated.tsx 를 안 건드리고 이 지점에서만 안전하게 색을 바꾼다.
 *
 * 신선구독/장바구니담기 버튼은 `atoms/Button`(size="l") 재사용 — `size="l"` 은
 * 텍스트(`text-heading-1`=18px/600)가 이 노드 실측과 정확히 일치하고 높이는
 * padding+content 로만 정해져 자체 height 클래스가 없어(비어있음), `className="h-14"`
 * (56px) 오버라이드가 캐스케이드 충돌 없이 안전하게 먹는다(Button.tsx SIZE_HEIGHT_CLASSNAME.l
 * 확인). `showSubscribeButton=false` 면(node 2490:1629, 2831:2424 — 신선구독 불가 상품)
 * 장바구니 담기 버튼이 혼자 전체 폭을 차지한다.
 *
 * 하단 패딩은 `showTerms` 로 갈린다 — 약관 고지가 보일 때(`pb-3`)는 그 텍스트 줄 자체가
 * 버튼 아래 여백을 채워 Figma 버튼-행 프레임 실측(112px, node 1233:110910)과 맞아떨어지지만,
 * 고지를 숨기는 화면(예: 상품 상세 고정 하단바, node 665:43103 — 약관 텍스트 레이어가
 * `hidden`)은 그 자리가 원래 홈 인디케이터 여유 44px 였다(get_metadata 로 확인: 버튼 행
 * 프레임 112px 중 pt-3(12)+버튼(56)=68, 나머지 44가 고지 없이도 남는 하단 여백).
 * `CartOrderBar` 의 `pb-11`(같은 이유, "홈 인디케이터 여유")과 동일한 값 — `showTerms=false`
 * 일 때만 그만큼을 명시적으로 되살린다.
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
  /** "장바구니 담기" 버튼 비활성화(예: 옵션 수량 합계가 0일 때) — 기본 false. */
  addToCartDisabled?: boolean;
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
  addToCartDisabled = false,
  showTerms = true,
  className,
}: AddToCartActionsProps) {
  return (
    <div className={['flex w-full flex-col', className].filter(Boolean).join(' ')}>
      {promotion ? (
        <PromotionBar text={promotion.text} emphasisText={promotion.emphasisText} />
      ) : null}

      <div className={`flex flex-col gap-3 px-4 pt-3 ${showTerms ? 'pb-3' : 'pb-11'}`}>
        <div className="flex items-center gap-2">
          <IconButton
            variant="outlineBlack"
            size="l"
            icon={liked ? 'heart-filled' : 'heart'}
            onClick={onToggleLike}
            aria-label={liked ? '찜 해제' : '찜하기'}
            aria-pressed={liked}
            className={liked ? '[--color-brand-500:var(--color-brand-300)]' : undefined}
          />
          {showSubscribeButton ? (
            <Button variant="tertiary" size="l" onClick={onSubscribe} className="h-14 flex-1">
              신선구독
            </Button>
          ) : null}
          <Button
            variant="primary"
            size="l"
            onClick={onAddToCart}
            disabled={addToCartDisabled}
            className="h-14 flex-1"
          >
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
