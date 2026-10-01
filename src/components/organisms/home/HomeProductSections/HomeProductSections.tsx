'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Icon } from '@/components/atoms/Icon';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import {
  DisplaySectionList,
  type DisplaySectionProduct,
} from '@/components/organisms/home/DisplaySectionList';
import { HomeProductSectionsSkeleton } from '@/components/organisms/home/HomeProductSections/HomeProductSectionsSkeleton';
import { QuickMenuSection } from '@/components/organisms/home/QuickMenuSection';
import { MultiOptionSelectBottomSheet } from '@/components/organisms/product/MultiOptionSelectBottomSheet';
import { ProductOptionSheet } from '@/components/organisms/product/ProductOptionSheet';
import { useHomeRecommendations } from '@/hooks/home/useHomeRecommendations';
import { useProductDetail } from '@/hooks/product/useProductDetail';
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
 *
 * "담기"는 `DisplaySectionList`가 클릭된 카드의 `productId`를 넘겨준다(이미 배선돼
 * 있었음) — 이 컴포넌트는 그 id로 `useProductDetail`을 조회해 실 SKU(`units[]`)를
 * 얻은 뒤에야 시트를 연다(이슈 #193, #143과 동일하게 홈 추천상품 id는 GROUP이라 그대로
 * 장바구니에 못 쓴다 — 상세 조회로 UNIT을 받아야 한다, #143 "확인된 사실" 참고).
 * `units.length`로 단일/다중 옵션 시트를 가른다 — `ProductDetailInteractiveShell`과
 * 동일한 분기.
 *
 * 담기 성공(`onAddToCart`) 시 완료 시트 대신 바로 `/cart`로 보낸다 — 상품 상세와 달리
 * 홈은 "함께 구매하면 좋을 상품" 같은 후속 추천이 아직 없어, 지금은 바로 장바구니를
 * 보여주는 쪽이 더 유용하다는 판단(#193).
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
  const router = useRouter();
  // 시트 열림(`sheetOpen`)과 조회 대상(`activeProductId`)을 분리해둔다 — 닫을 때
  // `activeProductId`를 같이 비우면 시트가 즉시 언마운트돼 BottomSheet의 닫힘
  // 슬라이드 애니메이션(`open` false → 트랜지션)이 재생될 틈이 없다.
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { data, isPending, isError } = useHomeRecommendations();
  const detailQuery = useProductDetail(activeProductId ?? '', activeProductId !== null);

  if (isPending) {
    return <HomeProductSectionsSkeleton />;
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

  const detail = activeProductId !== null ? detailQuery.data : undefined;
  const productImageSrc = detail?.media.find((m) => m.mediaRole === 'THUMBNAIL')?.mediaUrl;

  function closeSheet() {
    setSheetOpen(false);
  }

  function handleAddedToCart() {
    setSheetOpen(false);
    router.push('/cart');
  }

  return (
    <>
      <QuickMenuSection quickMenus={quickMenus} />

      {productSections.map((section) => (
        <DisplaySectionList
          key={section.type}
          title={section.title}
          products={(section.products ?? []).map(toDisplaySectionProduct)}
          onAddToCart={(productId) => {
            setActiveProductId(productId);
            setSheetOpen(true);
          }}
        />
      ))}

      {detail && detail.units.length > 1 ? (
        <MultiOptionSelectBottomSheet
          open={sheetOpen}
          onClose={closeSheet}
          onAddToCart={handleAddedToCart}
          productName={detail.name}
          productTagline={detail.shortDescription}
          productImageSrc={productImageSrc}
          units={detail.units}
        />
      ) : null}

      {detail?.units[0] && detail.units.length <= 1 ? (
        <ProductOptionSheet
          open={sheetOpen}
          onClose={closeSheet}
          onAddToCart={handleAddedToCart}
          productName={detail.name}
          productTagline={detail.shortDescription}
          productImageSrc={productImageSrc}
          unit={detail.units[0]}
        />
      ) : null}
    </>
  );
}
