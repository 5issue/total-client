import { ReviewCard } from '@/components/molecules/product/ReviewCard';
import { ReviewListControlBar } from '@/components/molecules/product/ReviewListControlBar';
import { ReviewSummaryCard } from '@/components/organisms/product/ReviewSummaryCard';

import { MOCK_REVIEWS } from './mock';

/**
 * "후기" 탭 전체 콘텐츠 (organism). Figma "5팀 UI 공유용" node 665-43657 —
 * `ReviewSummaryCard` + `ListControlBar` + `Review_Info_Card` 8건(구분선 포함, 마지막
 * 카드 뒤엔 구분선 없음).
 *
 * "총 30,042개"(ListControlBar)와 상위 `TabBar` 의 "후기 3,000"(ProductDetailView)은
 * 같은 Figma 화면(node 665:43657/43685) 안에서도 서로 다른 숫자다 — 디자인 원본 자체의
 * 불일치라 둘 다 각 노드 실측 그대로 두고 임의로 맞추지 않았다.
 *
 * `ReviewSummaryCard`(y=160~360)와 그 아래 리스트 프레임(y=368) 사이에 metadata 실측
 * 8px 틈이 있다 — 화면 배경(bg/secondary, `bg-surface-secondary`)이 카드 사이로 살짝
 * 비치는 간격이라 마진이 아니라 그 배경색을 가진 스페이서로 재현했다.
 */
export function ProductReviewTab() {
  return (
    <div className="flex w-full flex-col">
      <ReviewSummaryCard />
      <div aria-hidden className="bg-surface-secondary h-2 w-full" />
      <ReviewListControlBar totalCountLabel="총 30,042개" sortLabel="추천순" />
      {MOCK_REVIEWS.map((review, i) => (
        <div key={review.username + i} className="flex w-full flex-col">
          {i > 0 ? (
            <div className="bg-surface flex w-full items-center justify-center px-4 py-2.5">
              <div className="border-border w-full border-t" />
            </div>
          ) : null}
          <ReviewCard {...review} />
        </div>
      ))}
    </div>
  );
}
