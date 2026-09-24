'use client';

import { useState } from 'react';

import { Icon } from '@/components/atoms/Icon';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import {
  DisplaySectionList,
  type DisplaySectionProduct,
} from '@/components/organisms/home/DisplaySectionList';
import { QuickMenuSection } from '@/components/organisms/home/QuickMenuSection';
import { ProductOptionSheet } from '@/components/organisms/product/ProductOptionSheet';
import { useHomeRecommendations } from '@/hooks/home/useHomeRecommendations';
import { formatPrice } from '@/lib/formatters';
import type { HomeSectionProduct } from '@/types/home';

/**
 * 홈 퀵메뉴 + 진열 섹션 + 장바구니 담기 바텀시트를 함께 소유하는 클라이언트 경계.
 * `(shop)/page.tsx` 는 서버 컴포넌트로 남기고, 시트 열림 상태(`useState`)가 필요한
 * 이 부분만 분리했다(RSC 우선 원칙, `ShopShell`/`SwipeTabShell` 과 같은 패턴).
 *
 * 모든 섹션이 같은 시트 인스턴스 하나를 공유한다 — 어느 카드의 "담기"를 눌러도
 * `ProductOptionSheet` 하나가 열린다(node 838:65977 확인, 상품마다 다른 시트가
 * 아니라 화면에 시트 오버레이가 하나 뜨는 구조).
 *
 * `#136`부터 `useHomeRecommendations` 하나로 퀵메뉴(`QuickMenuSection`)와 진열 섹션을
 * 모두 그린다 — 두 organism 이 같은 응답의 다른 조각을 쓰는데, 훅 구독·로딩·에러 소유를
 * 컨테이너 하나로 모으는 원칙(`ProductGrid`, #90 리뷰) 때문에 `QuickMenuSection`은 이제
 * 순수 presentational(quickMenus prop 수신)이고, 이 컴포넌트가 유일한 구독자다.
 *
 * `ProductSummaryDto`(홈 API)엔 배송타입/리뷰수/쿠폰뱃지/Kurly Only 필드가 없다 — PR #131
 * (검색 결과 API 연동, `mapSpringProductListResponse`)이 이미 같은 갭을 겪었고 거기서
 * "필드를 생략하지 않고 안전한 mock 값을 채운다"로 정한 관례를 그대로 따른다(두 화면이
 * 서로 다른 방식이면 나중에 헷갈린다는 피드백 반영, 2026-09-24). 값도 그 커밋의
 * `MOCK_REVIEW_COUNT`/`MOCK_COUPON_BADGE_LABEL`/`MOCK_DELIVERY_TYPE`과 동일하게 맞췄다
 * (#131이 아직 develop에 병합되지 않아 상수를 직접 import하지 못하고 리터럴로 중복해뒀다 —
 * 병합되면 공용 상수로 옮기는 걸 고려).
 */
const MOCK_DELIVERY_LABEL = '샛별배송';
const MOCK_REVIEW_COUNT_LABEL = '9,999+';
const MOCK_COUPON_PERCENT_LABEL = '+25%';

function toDisplaySectionProduct(item: HomeSectionProduct): DisplaySectionProduct {
  const hasDiscount = Boolean(item.discountRate) && item.price !== item.salePrice;
  return {
    id: String(item.id),
    imageSrc: item.thumbnailUrl ?? undefined,
    imageAlt: item.name,
    deliveryLabel: MOCK_DELIVERY_LABEL,
    name: item.name,
    priceLabel: `${formatPrice(item.salePrice)}~`,
    reviewCountLabel: MOCK_REVIEW_COUNT_LABEL,
    couponPercentLabel: MOCK_COUPON_PERCENT_LABEL,
    kurlyOnly: true,
    ...(hasDiscount
      ? {
          originalPriceLabel: item.price.toLocaleString('ko-KR'),
          discountLabel: `${item.discountRate}%`,
        }
      : {}),
  };
}

export function HomeProductSections() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { data, isPending, isError } = useHomeRecommendations();

  if (isPending) {
    return (
      <p className="text-label-m text-fg-tertiary w-full px-4 py-8 text-center">
        홈 화면을 불러오는 중이에요
      </p>
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        className="px-4 py-8"
        icon={<Icon name="alert" size={56} aria-hidden />}
        title="홈 화면 정보를 불러오지 못했어요"
        description="잠시 후 다시 시도해주세요"
      />
    );
  }

  const quickMenus = data.sections.find((section) => section.quickMenus)?.quickMenus ?? [];
  const productSections = data.sections.filter((section) => section.products);

  return (
    <>
      <QuickMenuSection quickMenus={quickMenus} />

      {productSections.map((section) => (
        <DisplaySectionList
          key={section.type}
          title={section.title}
          products={(section.products ?? []).map(toDisplaySectionProduct)}
          onAddToCart={() => setSheetOpen(true)}
        />
      ))}

      <ProductOptionSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
