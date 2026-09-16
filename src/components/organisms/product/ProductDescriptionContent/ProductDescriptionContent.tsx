import { InstructionBanner } from '@/components/molecules/shared/InstructionBanner';
import { ProductCheckPointSection } from '@/components/organisms/product/ProductCheckPointSection';
import { ProductDetailTable } from '@/components/organisms/product/ProductDetailTable';

/**
 * 상품 브랜드 스토리 + Check Point + 상세 이미지 + 상품정보제공고시 (organism).
 * Figma "5팀 UI 공유용" `Frame 1430106463`(node 665:43696/43764) — "상품설명"과
 * "상세정보" 탭이 공유하는 콘텐츠 블록(두 탭 모두 이 프레임 구조가 동일하게 반복).
 *
 * 브랜드 이미지 2종(image 42, image 5691/5692)은 백엔드 제공 전까지 회색 박스(다른
 * 이미지 슬롯과 동일 관례). 이미지/구분선 모두 `px-4` 인셋 wrapper + `w-full` 조합만
 * 쓴다 — `mx-4` 단독은 부모가 `items-start`(shrink-to-fit)라 콘텐츠 없는 요소가
 * 0폭으로 접히는 함정(PromotionBar 에서 이미 겪은 버그, 처음부터 안전한 패턴으로).
 *
 * 이 블록의 텍스트는 상품 콘텐츠(브랜드 스토리)라 향후 mock prop 화 대상이지만,
 * 지금은 Figma 예시 상품("연세우유") 문구를 그대로 쓴다.
 *
 * "상품정보제공고시" 제목은 이 표(`ProductDetailTable`) 앞에 오는 `ProductCheckPointHeader`
 * 인스턴스의 실제 오버라이드 텍스트를 못 받아, 전자상거래법상 이 표의 정형 제목을 그대로 썼다.
 */
export function ProductDescriptionContent() {
  return (
    <div className="flex w-full flex-col items-start gap-8 pt-8">
      <InstructionBanner text="아래 이미지를 터치하면 확대해서 볼 수 있습니다." />

      <div className="w-full px-4">
        <div aria-hidden className="bg-surface-secondary rounded-m aspect-[369/245] w-full" />
      </div>

      {/* node 665:43700 실측 재확인 — 태그라인은 Heading/H0_SemiBold(20px), 상품명은
          Display/L(30px)로 둘 다 처음에 더 작은 토큰(label-l/heading-0)을 잘못 썼었다. */}
      <div className="flex w-full flex-col items-center gap-2.5 px-4 text-center">
        <p className="text-heading-0 text-fg-secondary">본연의 맛이 담긴 온 가족 우유</p>
        <p className="text-display-l text-fg">
          [연세우유 x 마켓컬리]
          <br />
          전용목장우유
        </p>
      </div>

      {/* node 665:43703 실측 — Label/M 사이즈(14px)에 Light(300) 굵기라 프로젝트 토큰
          중 정확히 겹치는 게 없다(가장 얇은 게 400/Regular) — 크기(14px)가 맞는
          label-xs 로 근사(기존 body-s=15px 는 크기부터 틀렸었다). */}
      <p className="text-label-xs text-fg px-4">
        온 가족을 위한 냉장고 속 필수품, 바로 우유인데요. 컬리가 연세우유와 함께 전용목장우유를
        선보입니다. 사료부터 목장 위생, 젖소의 건강까지 세심하게 관리하는 연세우유 전용목장에서
        생산된 국산 1급 A원유(세균수 기준)랍니다. 연세대학교의 식품 과학 기술로 탄생시킨 RT공법을
        적용해 우유 본연의 풍부하고 진한 맛을 오롯이 담아냈어요. 언제든 부담 없이 즐길 수 있도록
        준비했으니, 넉넉하게 챙겨두어도 좋을 거예요.
      </p>

      <div className="w-full px-4">
        <div className="border-border w-full border-t" />
      </div>

      <ProductCheckPointSection
        groups={[
          {
            title: '재료와 성분',
            items: ['국산 원유 100%', '세균수 기준 1급 A원유'],
          },
          {
            title: '생산 유통 과정',
            items: [
              '컬리와 연세우유의 콜라보레이션으로 탄생한 우유',
              '연세우유만의 RT(Rich Taste) 공법으로 본연의 맛을 보존',
              '연세우유가 직접 관리하는 전용목장 우유',
              'HACCP 인증 시설에서 위생적으로 생산',
            ],
          },
          { title: '활용법', items: ['풍부하고 진한 맛을 지닌 우유'] },
          { title: '브랜드와 생산자', items: ['기술력을 토대로 유제품을 제조하는, 연세우유'] },
        ]}
      />

      <div className="w-full px-4">
        <div className="border-border w-full border-t" />
      </div>

      <InstructionBanner text="아래 이미지를 터치하면 확대해서 볼 수 있습니다." />

      <div className="w-full px-4">
        <div aria-hidden className="bg-surface-secondary rounded-m aspect-[370/224] w-full" />
      </div>
      <div className="w-full px-4">
        <div aria-hidden className="bg-surface-secondary rounded-m aspect-[370/895] w-full" />
      </div>

      {/* node 665:43722 실측 — Label_XS_Regular(400weight) + text/secondary, label-m(500)
          text-fg 는 굵기·색 둘 다 틀렸었다. */}
      <p className="text-label-xs text-fg-secondary w-full text-center">
        [연세우유 x 마켓컬리] 전용목장우유 900mL
      </p>

      <div className="w-full px-4">
        <div className="border-border w-full border-t" />
      </div>

      <div className="flex w-full flex-col items-start gap-4 pb-8">
        <p className="text-display-xs text-fg flex h-10 items-center px-4">상품정보제공고시</p>
        <div className="w-full px-4">
          <ProductDetailTable />
        </div>
      </div>
    </div>
  );
}
