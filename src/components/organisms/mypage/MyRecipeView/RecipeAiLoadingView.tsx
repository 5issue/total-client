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
    /* Figma 상 콘텐츠 중심이 프레임 정중앙보다 42px 위에 있다 — `transform`(translate)
       대신 아래쪽에만 여백(84px = 42px×2)을 더해 같은 결과를 낸다. 부모(`MyFridgeView`)의
       `sticky` 헤더와 같은 스택 레벨에서 `transform`이 만드는 별도 stacking context가
       사파리 계열에서 sticky 렌더링과 얽히는 경우가 있어 이 방식이 더 안전하다. */
    <div className="bg-recipe-ai-loading-bg relative flex min-h-dvh flex-col items-center justify-center gap-8 overflow-hidden px-5 pb-21">
      <div className="relative flex size-32.5 items-center justify-center">
        <Image
          src="/mypage/recipe-ai-loading-ring.svg"
          alt=""
          fill
          className="animate-recipe-ai-spin motion-reduce:animate-none"
        />
        {/* 마크 원은 66px(=33px 마크 + 16.5px 여백×2, node 1343-109142 실측) — 이전엔
            37px(size-9.25)짜리 원에 16px(p-4) 여백을 줘서 마크가 5px밖에 안 보였다. */}
        <span className="bg-recipe-ai-loading-mark drop-shadow-recipe-ai-mark p-4.125 relative flex size-16.5 items-center justify-center rounded-full">
          <Image src="/mypage/recipe-ai-loading-mark.svg" alt="" width={33} height={33} />
        </span>
      </div>

      <div role="status" className="flex flex-col items-center gap-1 text-center">
        <p className="text-display-xs text-primary font-semibold">MY 레시피 제작 중</p>
        <p className="text-heading-6 text-fg-secondary font-normal">
          <span className="text-fg-secondary">컬리 AI</span>가 {nickname}님을 위한 레시피를 만들고
          있어요
        </p>
      </div>
    </div>
  );
}
