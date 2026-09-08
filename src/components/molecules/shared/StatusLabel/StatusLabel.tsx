import type { ReactNode } from 'react';

/**
 * 도메인 무관 상태/라벨 뱃지 (Figma "Badge" 컴포넌트 세트, node 2429-1816~2429-2355,
 * 2825-2140). 구독중/보유중/공지/혜택/기본배송지/컬리온리/광고라벨/케이뱅크 프로모 등
 * 여러 도메인이 공유해서 shared 에 둔다(structure-convention §3).
 *
 * atom Badge(구매유도용 cyan/purple)와는 목적이 달라 별도 컴포넌트로 분리 — 이름도
 * atom Badge 와 겹치지 않게 StatusLabel 로 뒀다.
 */
export type StatusLabelType =
  | 'owned'
  | 'subscribed'
  | 'inactive'
  | 'notice'
  | 'rewards'
  | 'defaultAddress'
  | 'kurlyOnly'
  | 'adLabelS'
  | 'adLabelL'
  | 'adLabelM'
  | 'kbank';

export interface StatusLabelProps {
  type: StatusLabelType;
  children: ReactNode;
  className?: string;
}

/**
 * type 별 배경·텍스트·radius·패딩·타이포. Figma 실측을 그대로 옮겼다(get_design_context
 * 1:1) — kbank 만 배경이 그라디언트라 아래에서 별도 분기한다.
 *
 * inactive/rewards/defaultAddress/adLabelM 은 Figma 프레임이 padding+줄높이로 계산되는
 * 자연 높이보다 더 큰 고정 높이(h-*)를 명시적으로 갖고 있다(패딩이 none인데도 프레임만
 * 더 큼) — 패딩만으로는 재현이 안 돼서 높이를 별도로 박아둔다.
 *
 * owned/inactive/notice/rewards/adLabelS/adLabelL/kbank 는 Figma 상 Bold(700), adLabelM 은
 * SemiBold(600)로 바인딩돼 있다 — `text-caption-*` 토큰 자체의 font-weight 는 Regular(400)
 * 고정이지만, `font-*` 유틸리티가 뒤에 오면 실측상 항상 이긴다(getComputedStyle 로 검증:
 * `text-caption-s font-bold` → 700). 그래서 덧붙여서 실제 굵기를 맞춘다.
 *
 * kurlyOnly 는 Figma 상 "Numeric/Numeric_S"(SF Pro Black, 900) 바인딩이라 caption 이 아니라
 * `text-numeric-s`(10px/14px/900)가 더 가깝다 — 다만 font-family 는 프로젝트에 SF Pro 가
 * 없어 Pretendard(`--font-sans`) 그대로 간다.
 */
const STYLE_BY_TYPE: Record<StatusLabelType, string> = {
  owned: 'bg-orange/4 text-orange rounded-s p-1 text-caption-s font-bold',
  subscribed: 'bg-brand-50 text-primary rounded-s px-2 py-1 text-label-m',
  inactive: 'bg-overlay-blue text-fg rounded-s h-5 px-2 text-caption-s font-bold',
  notice: 'bg-overlay-blue text-fg rounded-s px-2 py-1 text-caption-s font-bold',
  rewards:
    'bg-orange/4 text-fg-danger rounded-full h-status-label-rewards px-2 text-caption-s font-bold',
  defaultAddress: 'bg-surface-secondary text-fg-secondary rounded-full h-6 px-2 text-caption-m',
  kurlyOnly: 'bg-overlay-blue text-primary rounded-s px-2 py-1 text-numeric-s',
  adLabelS: 'bg-overlay text-fg-inverse rounded-s px-1 text-caption-s font-bold',
  adLabelL: 'bg-overlay text-fg-inverse rounded-s px-2 py-1 text-caption-s font-bold',
  adLabelM:
    'bg-surface-secondary text-fg-disabled rounded-full h-5 px-2 text-caption-m font-semibold',
  kbank: 'text-fg-inverse rounded-s h-4 px-1 text-caption-s font-bold',
};

const BASE_CLASSNAME = 'inline-flex items-center justify-center whitespace-nowrap';

export function StatusLabel({ type, children, className }: StatusLabelProps) {
  if (type === 'kbank') {
    return (
      <span className={['inline-flex items-center', className].filter(Boolean).join(' ')}>
        <KbankPointer />
        <span className={[BASE_CLASSNAME, 'bg-kbank-gradient', STYLE_BY_TYPE.kbank].join(' ')}>
          {children}
        </span>
      </span>
    );
  }

  return (
    <span className={[BASE_CLASSNAME, STYLE_BY_TYPE[type], className].filter(Boolean).join(' ')}>
      {children}
    </span>
  );
}

/**
 * 케이뱅크 프로모 뱃지 좌측 말풍선 꼬리 (Figma node 2825-2141 "Polygon 4"). 원본 asset은
 * 위쪽을 가리키는 삼각형이고, Figma 자체 생성 코드도 -90도 회전(`-rotate-90`)해서 왼쪽을
 * 가리키게 쓴다 — path/viewBox 는 원본 그대로 두고 동일하게 회전만 적용했다.
 */
function KbankPointer() {
  return (
    <span className="h-kbank-pointer w-kbank-pointer inline-flex shrink-0 items-center justify-center">
      <svg
        width="7.79423"
        height="4.57226"
        viewBox="0 0 7.79423 4.57226"
        fill="none"
        className="-rotate-90"
        aria-hidden
      >
        <path
          d="M3.09416 0.403961C3.49398 -0.134653 4.30025 -0.134654 4.70007 0.40396L7.79423 4.57226H0L3.09416 0.403961Z"
          fill="var(--color-kbank-pointer)"
        />
      </svg>
    </span>
  );
}
