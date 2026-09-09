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
 *
 * 아이콘-텍스트 간격은 `Gap/2XS`(4px). Secondary 배경은 `Icon/Tertiary` =
 * `#8AA1AB`(neutral-700, 회청색)다.
 * 텍스트/아이콘 색은 variant 가 아니라 요소별로 고정이다 — 두 variant 모두 텍스트와
 * 동일하게 `fg-inverse`(흰색)를 쓴다(#54 — 원래 아이콘만 `fg` 로 고정돼 저대비였던 것을
 * 디자인 확인 후 흰색으로 통일).
 *
 * `shape="icon"`(issue #67, Figma node 3410-6270 "Floating")은 텍스트 없이 아이콘만
 * 있는 원형 변형이다 — 흰 배경 + `border-border`(#DDE4ED) 테두리로 `pill`(텍스트형,
 * 브랜드 배경)과 배색이 완전히 달라 `variant` 로 묶지 않고 별도 `shape` 로 분기했다.
 * 시각 콘텐츠가 아이콘뿐이라 `aria-label` 이 필수다(아이콘 자체는 장식용 aria-hidden).
 */
export type FloatingButtonVariant = 'primary' | 'secondary';
export type FloatingButtonShape = 'pill' | 'icon';

type FloatingButtonPillProps = {
  shape?: 'pill';
  variant?: FloatingButtonVariant;
  /** 장식용(aria-hidden)으로 렌더한다 — 접근 가능한 이름은 항상 children 텍스트가 담당. */
  icon?: IconName;
  /** 아이콘 전용 사용은 미지원이라 항상 필수(`null` 도 금지 — 접근 가능한 이름 보장). */
  children: NonNullable<ReactNode>;
};

type FloatingButtonIconProps = {
  shape: 'icon';
  icon: IconName;
  /** 시각 콘텐츠가 아이콘뿐이라 접근 가능한 이름 필수. */
  'aria-label': string;
  children?: undefined;
};

export type FloatingButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> &
  (FloatingButtonPillProps | FloatingButtonIconProps);

const VARIANT_CLASSNAME: Record<FloatingButtonVariant, string> = {
  primary: 'bg-brand-secondary text-fg-inverse',
  secondary: 'bg-neutral-700 text-fg-inverse',
};

export function FloatingButton(props: FloatingButtonProps) {
  const { className, type = 'button' } = props;

  if (props.shape === 'icon') {
    const {
      shape: _shape,
      icon,
      children: _children,
      className: _cn,
      type: _type,
      ...buttonProps
    } = props;
    return (
      <button
        type={type}
        className={[
          'border-border bg-surface inline-flex size-12 items-center justify-center rounded-full border p-2.5',
          'transition-colors motion-reduce:transition-none',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...buttonProps}
      >
        <Icon name={icon} size={24} aria-hidden />
      </button>
    );
  }

  const {
    shape: _shape,
    variant = 'primary',
    icon,
    children,
    className: _cn,
    type: _type,
    ...buttonProps
  } = props;

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
      {...buttonProps}
    >
      {icon ? <Icon name={icon} size={20} aria-hidden className="text-fg-inverse" /> : null}
      {children}
    </button>
  );
}
