'use client';

import { SocialLoginButton } from '@/components/molecules/auth/SocialLoginButton';
import { useSocialLogin } from '@/hooks/auth/useSocialLogin';

/**
 * 로그인 화면의 소셜 로그인 진입 영역 (organism).
 * Figma "5팀 UI 공유용" — node 460-8161 "Login Options Container". 카카오·네이버만.
 *
 * `useSocialLogin` 이 로그인 URL을 받아 브라우저를 제공자 동의화면으로 이동시킨다.
 * 진행 중에는 두 버튼 모두 비활성화(중복 클릭 방지), 시작 실패 시 안내 문구를 띄운다.
 * 버튼 순서·색·라벨은 `SocialLoginButton`(molecule)이 소유한다.
 */
export interface SocialLoginPanelProps {
  className?: string;
}

export function SocialLoginPanel({ className }: SocialLoginPanelProps) {
  const { mutate, isPending, isError } = useSocialLogin();

  return (
    <div
      aria-busy={isPending}
      className={['flex flex-col gap-3', className].filter(Boolean).join(' ')}
    >
      {isError ? (
        <p role="alert" className="text-label-m text-fg-danger text-center">
          로그인을 시작하지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
      ) : null}

      <SocialLoginButton provider="naver" onClick={() => mutate('naver')} disabled={isPending} />
      <SocialLoginButton provider="kakao" onClick={() => mutate('kakao')} disabled={isPending} />
    </div>
  );
}
