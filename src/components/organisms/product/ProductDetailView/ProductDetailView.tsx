import { ProductDescriptionContent } from '@/components/organisms/product/ProductDescriptionContent';
import { ProductReviewTab } from '@/components/organisms/product/ProductReviewTab';
import { ProductSpecTab } from '@/components/organisms/product/ProductSpecTab';

import { ProductDetailInteractiveShell } from './ProductDetailInteractiveShell';

/**
 * 상품 상세 화면 컨테이너 (organism, RSC). Figma "5팀 UI 공유용" node 665-43030.
 * page.tsx 는 이 컴포넌트만 렌더한다(RSC 유지).
 *
 * 이슈 #134에서 대표 이미지+`ProductOverviewCard`(실 API 의존)를
 * `ProductDetailInteractiveShell` 로 옮겼다 — 이 두 조각은 `useProductDetail` 로딩/에러
 * 상태에 따라 갈리는데, 그 상태를 소유한 클라 경계 밖(RSC)에서는 분기를 미리 렌더해
 * 내려줄 수 없다. 원산지/후기/첫구매가/배송정보 등 계약에 없는 필드는 당분간 mock
 * 유지(`ProductDetailInteractiveShell` 내부 `MOCK_STATIC_OVERVIEW_FIELDS` 참고).
 *
 * "상세정보" 탭은 `ProductSpecTab`(node 665-43688), "후기" 탭은 `ProductReviewTab`
 * (node 665-43657), "문의" 탭은 `InquiryTab`(node 665-43879)으로 연결됨 — 이로써
 * 4개 탭 모두 구현 완료.
 * 헤더+탭은 `sticky top-0`(Figma 프레임상 별도 고정 블록, node 665:43031), 하단 CTA 는
 * `CartOrderBar` 와 동일하게 `sticky bottom-0`(문서 흐름 안에서 뷰포트 바닥에 붙음 —
 * ShopShell 크롬리스 처리와 함께라야 BottomNav 와 안 겹친다).
 *
 * 탭 제어·좋아요·바텀시트·toast 같은 실제 상호작용은 `ProductDetailInteractiveShell`
 * (client)로 옮겼다 — 이 컴포넌트 자체는 RSC 로 남아, `ProductDescriptionContent`·
 * `ProductSpecTab`·`ProductReviewTab` 같은 무거운 정적 콘텐츠가 서버에서 렌더되고 클라
 * 번들에 포함되지 않는다(코드래빗 리뷰 반영 — 예전엔 이 화면 전체가 `'use client'` 라 그
 * 콘텐츠까지 전부 포함돼 있었다, #101 QA). "상품설명" 탭의 정적 콘텐츠(설명)는
 * `descriptionSlot` 으로, "상세정보"/"후기" 탭은 각각 `specSlot`/`reviewSlot` 로 미리
 * 렌더해 내려준다 — "문의" 탭만 셸이 직접 렌더한다(그 탭이 셸 소유 상태
 * (`inquiryModalOpen`)를 갱신하는 콜백을 받아야 해서, 함수를 props 로 못 넘기는
 * RSC→클라 경계를 건널 수 없다).
 */
export function ProductDetailView({ productId }: { productId: string }) {
  return (
    <ProductDetailInteractiveShell
      productId={productId}
      descriptionSlot={<ProductDescriptionContent />}
      specSlot={<ProductSpecTab />}
      reviewSlot={<ProductReviewTab />}
    />
  );
}
