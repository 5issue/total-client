'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { Icon, type IconName } from '@/components/atoms/Icon/Icon';

/**
 * 화면 위에 떠 있는 형태로 쓰는 pill 버튼 (atom). Figma "5팀 디자인 시스템" —
 * node 2427-1325 "Floating Button"(Style=Primary/Secondary).
 *
 * 기존 `Button` atom과 헷갈리기 쉬운데, `Button`은 `rounded-m`(8px)인 반면
 * 이 컴포넌트는 Figma 변수가 `Radius/Full`(9999, 완전 pill)로 바인딩돼 있어
 * 시각적으로 다른 컴포넌트다 — `Button`의 variant로 흡수하지 않고 별도로 뒀다.
 * (구현 전 `get_variable_defs`로 두 컴포넌트 라운드값을 직접 비교해 확인함.)
 *
 * Primary(2427:1312)/Secondary(2427:1311) 두 노드의 변수 바인딩 + 스크린샷 픽셀
 * 샘플링(PIL로 아이콘/텍스트 영역 각각 최빈값 색을 직접 추출)까지 함께 대조해
 * 재검증함(2026-09-04). 아이콘-텍스트 간격은 `Gap/2XS` = 4px 인데 처음엔
 * `gap-2`(8px)로 잘못 넣었었다. Secondary 배경은 `Icon/Tertiary` =
 * `#8AA1AB`(neutral-700)인데 처음엔 `surface-secondary`(#F0F5F8, 거의 흰색)로
 * 잘못 넣었었다 — 스크린샷상 뚜렷한 회청색 pill 이다.
 * 텍스트/아이콘 색은 **variant 가 아니라 요소별로** 고정이다 — 픽셀 샘플링 결과
 * 두 variant 모두 아이콘 최빈값은 `#222222`(`Icon/Black_Inverse` = `fg`), 텍스트
 * 최빈값은 `#FFFFFF`(`Text/Inverse` = `fg-inverse`). 처음엔 작은 스크린샷을 육안
 * 판독하다 secondary 텍스트를 어두운 색으로 잘못 봤었는데(실제로는 텍스트는
 * 흰색·아이콘만 어두운 색), 픽셀 최빈값을 직접 세어 정정함 — primary 는 보라
 * 배경 위에 아이콘이 저대비로 어둡게 보이는 게 Figma 원본 그대로다(저대비가
 * 의도인지는 디자인 확인 필요).
 */
export type FloatingButtonVariant = 'primary' | 'secondary';

export interface FloatingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: FloatingButtonVariant;
  /** 장식용(aria-hidden)으로 렌더한다 — 접근 가능한 이름은 항상 children 텍스트가 담당. */
  icon?: IconName;
  /** 아이콘 전용 사용은 미지원이라 항상 필수. */
  children: ReactNode;
}

const VARIANT_CLASSNAME: Record<FloatingButtonVariant, string> = {
  primary: 'bg-brand-secondary text-fg-inverse',
  secondary: 'bg-neutral-700 text-fg-inverse',
};

export function FloatingButton({
  variant = 'primary',
  icon,
  children,
  className,
  type = 'button',
  ...props
}: FloatingButtonProps) {
  return (
    <button
      type={type}
      className={[
        'inline-flex h-11 items-center justify-center gap-1 rounded-full px-4',
        'text-heading-5 whitespace-nowrap transition-colors motion-reduce:transition-none',
        VARIANT_CLASSNAME[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {icon ? <Icon name={icon} size={20} aria-hidden className="text-fg" /> : null}
      {children}
    </button>
  );
}
