'use client';

import type { ButtonHTMLAttributes } from 'react';

import { Icon, type IconName } from '@/components/atoms/Icon/Icon';

/**
 * 소셜/컬리 로그인 진입 버튼 (Figma "button_Social", node 2429-2130~2133).
 * 공급자별 브랜드색이 디자인 시스템 컬러 토큰(--color-naver 등)으로 고정돼
 * atoms/Button 의 시맨틱 variant 로는 표현할 수 없어 별도 molecule 로 둔다.
 * Kurly 는 아이콘 없이 텍스트만 사용한다(Figma 반영).
 */
export type SocialProvider = 'naver' | 'kakao' | 'apple' | 'kurly';

export type SocialLoginButtonProps = {
  provider: SocialProvider;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

const PROVIDER_LABEL: Record<SocialProvider, string> = {
  naver: '네이버로 계속하기',
  kakao: '카카오로 계속하기',
  apple: 'Apple로 계속하기',
  kurly: '컬리 아이디로 로그인',
};

const PROVIDER_ICON: Partial<Record<SocialProvider, IconName>> = {
  naver: 'naver',
  kakao: 'kakao',
  apple: 'apple',
};

// naver/apple 아이콘은 themable: false(고정 흰색) 또는 currentColor 를 그대로 쓰므로
// 컨테이너 text 색만 맞추면 라벨과 아이콘이 함께 톤이 맞는다.
const PROVIDER_CLASSNAME: Record<SocialProvider, string> = {
  naver: 'bg-naver text-white',
  kakao: 'bg-kakao text-black',
  apple: 'bg-apple text-white',
  kurly: 'bg-primary text-fg-inverse',
};

export function SocialLoginButton({
  provider,
  className,
  type = 'button',
  ...props
}: SocialLoginButtonProps) {
  const icon = PROVIDER_ICON[provider];

  return (
    <button
      type={type}
      className={[
        'rounded-m text-heading-4 flex h-[52px] w-full items-center justify-center gap-1 px-4 py-3 whitespace-nowrap transition-colors motion-reduce:transition-none',
        PROVIDER_CLASSNAME[provider],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {icon ? <Icon name={icon} size={24} aria-hidden /> : null}
      {PROVIDER_LABEL[provider]}
    </button>
  );
}
