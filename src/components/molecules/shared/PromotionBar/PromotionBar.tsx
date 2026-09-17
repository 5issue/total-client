import Image from 'next/image';

/**
 * 혜택 고지 배너 — 아이콘 + 강조 문구 (molecule). Figma "5팀 디자인 시스템" >
 * `Banner/Promotion_Bar`(node 2429:2588), h-36px.
 *
 * 아이콘은 `atoms/GraphicIcon`(name="delivery", 보라색 원+흰 트럭)로 대체했었으나
 * 실제 자산은 배경 없이 청록→보라 그라데이션인 트럭 글리프였다(get_design_context
 * 로 실제 PNG를 직접 확인, 2429:2588 "image 59") — 아이콘 세트에 없는 전용 그라데이션
 * 자산이라 `public/icons/free-shipping-truck.png` 로 내려받아 그대로 쓴다.
 * 강조 구간(`emphasisText`, 예: "무료배송")은 `text-banner`(#a500f6, Secondary/Banner-Purple)
 * — 브랜드 프라이머리(#690085)와는 다른 별도 토큰이니 혼동 주의.
 */
export type PromotionBarProps = {
  /** 강조 전 일반 텍스트(예: "첫 구매니까, 하나만 사도 "). */
  text: string;
  /** 강조 텍스트(예: "무료배송"). */
  emphasisText: string;
  /** 모서리 override. 기본 `rounded-t-lg`(CTA 바 최상단에 flush로 붙는 원래 용법).
   *  장바구니 담기 완료 시트(node 665:43409)처럼 4면 다 둥글고 좌우 여백이 있는
   *  인라인 배너는 `rounded-m`으로 — `rounded-t-lg` 와 새 값을 동시에 주면(같은
   *  속성, 같은 우선순위) Tailwind 생성 순서에 따라 꼬여 완전 대체 방식으로 받는다. */
  roundedClassName?: string;
  className?: string;
};

export function PromotionBar({
  text,
  emphasisText,
  roundedClassName = 'rounded-t-lg',
  className,
}: PromotionBarProps) {
  return (
    <div
      className={[
        `bg-surface-secondary flex h-9 items-center justify-center gap-2 px-4 ${roundedClassName}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Image src="/icons/free-shipping-truck.png" alt="" width={20} height={20} aria-hidden />
      <p className="text-label-m text-fg font-bold whitespace-nowrap">
        {text}
        <span className="text-banner">{emphasisText}</span>
      </p>
    </div>
  );
}
