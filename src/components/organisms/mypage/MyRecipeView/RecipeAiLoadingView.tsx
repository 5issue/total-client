import Image from 'next/image';

/**
 * "AI 추천 레시피" 카드에서 상세로 들어갈 때 거치는 풀스크린 로딩(Figma node
 * 1343-109131 "AI Loading") — 트리거는 `MyRecipeView`가 담당한다. 회전 링 +
 * 그라데이션 원 안의 컬리 AI 마크, 안내 문구로 구성되며 상호작용은 없다.
 */
export interface RecipeAiLoadingViewProps {
  nickname: string;
}

export function RecipeAiLoadingView({ nickname }: RecipeAiLoadingViewProps) {
  return (
    <div className="bg-recipe-ai-loading-bg relative flex min-h-dvh flex-col items-center justify-center gap-6 overflow-hidden px-5">
      <div className="relative flex size-32.5 items-center justify-center">
        <Image
          src="/mypage/recipe-ai-loading-ring.svg"
          alt=""
          fill
          className="animate-spin [animation-duration:1.2s]"
        />
        <span className="bg-recipe-ai-loading-mark relative flex size-9.25 items-center justify-center rounded-full p-4 shadow-xl">
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
