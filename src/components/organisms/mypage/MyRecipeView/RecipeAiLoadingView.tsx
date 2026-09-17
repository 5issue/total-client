import Image from 'next/image';

/**
 * MY 레시피 탭 첫 진입 시 AI 추천을 준비하는 동안 보여주는 풀스크린 로딩
 * (Figma node 1343-109131 "AI Loading"). 회전 링 + 그라데이션 원 안의 컬리 AI
 * 마크, 안내 문구로 구성 — 상호작용은 없다.
 *
 * 트리거는 Figma에 명시가 없어 "MY 레시피 탭 첫 진입 시 짧은 mock 딜레이 후 콘텐츠
 * 표시"로 간주했다(디자인 확인 필요) — `MyRecipeView`가 이 뷰를 보여주는 타이밍을 갖는다.
 *
 * Figma 프레임 하단에 냉장고 만료 안내 문구(`MOCK_FRIDGE_EXPIRY_NOTICE`와 동일)가
 * 같이 있었는데, AI 레시피 로딩과 무관한 내용이라 인접 프레임이 섞인 것으로 보고
 * 제외했다(디자인 확인 필요).
 */
export interface RecipeAiLoadingViewProps {
  nickname: string;
}

export function RecipeAiLoadingView({ nickname }: RecipeAiLoadingViewProps) {
  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center gap-6 overflow-hidden px-5"
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 20%, color-mix(in srgb, var(--color-primary) 18%, transparent) 0%, transparent 60%)',
      }}
    >
      <div className="relative flex size-32.5 items-center justify-center">
        <Image
          src="/mypage/recipe-ai-loading-ring.svg"
          alt=""
          fill
          className="animate-spin"
          style={{ animationDuration: '1.2s' }}
        />
        <span
          className="relative flex size-9.25 items-center justify-center rounded-full p-4 shadow-xl"
          style={{
            backgroundImage: 'linear-gradient(126deg, #ac89ff 0.56%, #74befd 95.9%)',
          }}
        >
          <Image src="/mypage/recipe-ai-loading-mark.svg" alt="" width={33} height={33} />
        </span>
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-display-xs text-primary font-semibold">MY 레시피 제작 중</p>
        <p className="text-heading-6 text-fg-secondary font-normal">
          <span className="text-fg-secondary">컬리 AI</span>가 {nickname}님을 위한 레시피를 만들고
          있어요
        </p>
      </div>
    </div>
  );
}
