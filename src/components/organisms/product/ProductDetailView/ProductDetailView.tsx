import Image from 'next/image';

import { Badge } from '@/components/atoms/Badge';
import { ProductDescriptionContent } from '@/components/organisms/product/ProductDescriptionContent';
import { ProductOverviewCard } from '@/components/organisms/product/ProductOverviewCard';
import { ProductReviewTab } from '@/components/organisms/product/ProductReviewTab';
import { ProductSpecTab } from '@/components/organisms/product/ProductSpecTab';

import { MOCK_PRODUCT_OVERVIEW } from './mock';
import { ProductDetailInteractiveShell } from './ProductDetailInteractiveShell';

/**
 * 상품 상세 화면 컨테이너 (organism, RSC). Figma "5팀 UI 공유용" node 665-43030.
 * page.tsx 는 이 컴포넌트만 렌더한다(RSC 유지). 데이터는 퍼블리싱 단계라 목 데이터(`mock.ts`).
 *
 * 이번 단계 범위(이슈 #101 1~4): 상단 네비게이션+탭, 대표 이미지+ProductOverviewCard,
 * 하단 고정 CTA + 담기 바텀시트, 스크롤 상단이동 버튼. 브랜드/후기/추천상품/배송안내/
 * 상세설명/구매안내 섹션은 후속 Figma 스펙을 받아 이어서 추가한다(섹션 사이는 그대로
 * flex-col 로 쌓이므로 ProductOverviewCard 와 하단 CTA 바 사이에 순서대로 끼워 넣으면 된다).
 *
 * "상세정보" 탭은 `ProductSpecTab`(node 665-43688), "후기" 탭은 `ProductReviewTab`
 * (node 665-43657), "문의" 탭은 `InquiryTab`(node 665-43879)으로 연결됨 — 이로써
 * 4개 탭 모두 구현 완료.
 * 헤더+탭은 `sticky top-0`(Figma 프레임상 별도 고정 블록, node 665:43031), 하단 CTA 는
 * `CartOrderBar` 와 동일하게 `sticky bottom-0`(문서 흐름 안에서 뷰포트 바닥에 붙음 —
 * ShopShell 크롬리스 처리와 함께라야 BottomNav 와 안 겹친다).
 *
 * 탭 제어·좋아요·바텀시트·toast 같은 실제 상호작용은 `ProductDetailInteractiveShell`
 * (client)로 옮겼다 — 이 컴포넌트 자체는 RSC 로 남아, 대표 이미지·`ProductOverviewCard`·
 * `ProductDescriptionContent`·`ProductSpecTab`·`ProductReviewTab` 같은 무거운 정적
 * 콘텐츠가 서버에서 렌더되고 클라 번들에 포함되지 않는다(코드래빗 리뷰 반영 — 예전엔
 * 이 화면 전체가 `'use client'` 라 그 콘텐츠까지 전부 포함돼 있었다, #101 QA). "상품설명"
 * 탭 콘텐츠(대표 이미지+개요+설명)는 `descriptionSlot` 으로, "상세정보"/"후기" 탭은 각각
 * `specSlot`/`reviewSlot` 로 미리 렌더해 내려준다 — "문의" 탭만 셸이 직접 렌더한다(그
 * 탭이 셸 소유 상태(`inquiryModalOpen`)를 갱신하는 콜백을 받아야 해서, 함수를 props 로
 * 못 넘기는 RSC→클라 경계를 건널 수 없다).
 */
export function ProductDetailView() {
  const overview = MOCK_PRODUCT_OVERVIEW;

  return (
    <ProductDetailInteractiveShell
      overview={overview}
      descriptionSlot={
        <>
          <div className="relative aspect-square w-full overflow-hidden">
            {overview.imageSrc ? (
              <Image
                src={overview.imageSrc}
                alt={overview.name}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 640px"
                className="object-cover"
              />
            ) : (
              // 디자인 시스템 ImageThumbnail 실측 placeholder 색(node 2749:2149,
              // Text/disabled = neutral-500) — surface-secondary 아님.
              <div aria-hidden className="absolute inset-0 bg-neutral-500" />
            )}
            {overview.memberDeal ? (
              <Badge color="cyan" size="large" className="absolute top-4 left-4">
                멤버스특가
              </Badge>
            ) : null}
          </div>

          <ProductOverviewCard
            brandLabel={overview.brandLabel}
            shippingInfo={overview.shippingInfo}
            name={overview.name}
            subCopy={overview.subCopy}
            origin={overview.origin}
            reviewCountLabel={overview.reviewCountLabel}
            discountRate={overview.discountRate}
            originalPriceLabel={overview.originalPriceLabel}
            priceLabel={overview.priceLabel}
            specialPriceLabel={overview.specialPriceLabel}
            specialPriceNote={overview.specialPriceNote}
            deliveryRows={overview.deliveryRows}
          />
          <ProductDescriptionContent />
        </>
      }
      specSlot={<ProductSpecTab />}
      reviewSlot={<ProductReviewTab />}
    />
  );
}
