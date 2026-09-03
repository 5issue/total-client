import type { ReactNode } from 'react';

export type BadgeColor = 'purple' | 'cyan';
export type BadgeSize = 'small' | 'medium' | 'large';
/** purple 은 Figma 에 large 가 없다 — 타입에서부터 그 조합을 만들 수 없게 막는다. */
type PurpleBadgeSize = 'small' | 'medium';

interface BadgeCommonProps {
  className?: string;
  /** 순수 정보 표시용이라 항상 필수 — Chip/Button과 달리 상호작용이 없다. */
  children: ReactNode;
}

export type BadgeProps =
  | ({ color?: 'cyan'; size?: BadgeSize } & BadgeCommonProps)
  | ({ color: 'purple'; size?: PurpleBadgeSize } & BadgeCommonProps);

/**
 * cyan 은 Figma 세 사이즈 전부 동일 hex(#00c0da = --color-cyan)라 그대로 매핑했다.
 * purple 은 Figma 컴포넌트 세트에 Small(#d8a5e9 = brand-200) / Medium(#c16edd = brand-300)
 * 두 사이즈만 정의돼 있고 Large 는 애초에 존재하지 않는다(디자이너 확인 완료) — BadgeProps
 * 타입에서 이미 purple+large 조합 자체를 막아뒀다. large 항목은 Record<BadgeSize,...> 를
 * 완전하게 채우기 위한 내부 구현 디테일일 뿐, 정상적인 타입 경로로는 절대 쓰이지 않는다.
 */
const PURPLE_BG_CLASSNAME: Record<BadgeSize, string> = {
  small: 'bg-brand-200',
  medium: 'bg-brand-300',
  large: 'bg-brand-300',
};

/**
 * Figma 실측(Text/Inverse = #ffffff)을 그대로 따른다 — 흰 텍스트는 bg-cyan 에서 2.20:1,
 * bg-brand-300 에서 3.21:1로 본문 대비 기준(4.5:1, code-style-convention §5)에 못 미치는
 * 걸 알고도(CodeRabbit 이 지적) Figma 픽셀 일치를 우선하기로 결정한 것 — 접근성 재검토 필요.
 */
const TEXT_CLASSNAME = 'text-fg-inverse';

/** padding 은 색과 무관하게 사이즈로만 갈린다(get_variable_defs 로 확인한 Gap 토큰 동일). */
const SIZE_PADDING_CLASSNAME: Record<BadgeSize, string> = {
  small: 'px-2 py-1',
  medium: 'p-1',
  large: 'p-2',
};

/**
 * medium 은 색상마다 실제 폰트 크기가 다르다 — cyan(2427:1305, 58×22)은 Caption/S(10px),
 * purple(2427:1304, 93×24)은 Caption/M(12px)로 각각 다른 토큰이 바인딩돼 있었다
 * (get_variable_defs 확인, 실측 높이 22 vs 24 로도 교차 검증됨). small 은 두 색 다 42×18 로
 * 동일해 공통 처리한다. large 는 cyan 예시(text-label-xl, 14/20/700)만 있고 purple 은 없다
 * — Figma 실측은 Bold 인데 바인딩된 텍스트 스타일명은 Label_XS_Regular(400) 라 가중치가
 * 안 맞을 수 있음, 재확인 필요.
 */
const TEXT_SIZE_CLASSNAME: Record<BadgeColor, Record<BadgeSize, string>> = {
  cyan: { small: 'text-caption-s', medium: 'text-caption-s', large: 'text-label-xl' },
  purple: { small: 'text-caption-s', medium: 'text-caption-m', large: 'text-label-xl' },
};

export function Badge({ color = 'cyan', size = 'small', className, children }: BadgeProps) {
  const bgClassName = color === 'purple' ? PURPLE_BG_CLASSNAME[size] : 'bg-cyan';

  return (
    <span
      className={[
        'inline-flex items-center justify-center rounded-s whitespace-nowrap',
        bgClassName,
        TEXT_CLASSNAME,
        SIZE_PADDING_CLASSNAME[size],
        TEXT_SIZE_CLASSNAME[color][size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
