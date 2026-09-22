'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/atoms/Badge';
import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Icon } from '@/components/atoms/Icon';
import { Toast } from '@/components/atoms/Toast';
import { AddToCartActions } from '@/components/molecules/product/AddToCartActions';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import { MissionCompleteCard } from '@/components/molecules/shared/MissionCompleteCard';
import { TabBar, type TabBarItem } from '@/components/molecules/shared/TabBar';
import { CartAddedProductsBottomSheet } from '@/components/organisms/product/CartAddedProductsBottomSheet';
import { InquiryTab } from '@/components/organisms/product/InquiryTab';
import {
  PACKAGING_TYPE_LABEL,
  STORAGE_TYPE_LABEL,
  toProductDetailOverview,
} from '@/components/organisms/product/model';
import { MultiOptionSelectBottomSheet } from '@/components/organisms/product/MultiOptionSelectBottomSheet';
import { MOCK_STATIC_OVERVIEW_FIELDS } from '@/components/organisms/product/ProductDetailView/mock';
import { ProductOptionSheet } from '@/components/organisms/product/ProductOptionSheet';
import { ProductOverviewCard } from '@/components/organisms/product/ProductOverviewCard';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useProductDetail } from '@/hooks/product/useProductDetail';
import { useScrollToTopVisibility } from '@/hooks/useScrollToTopVisibility';

const TABS: TabBarItem[] = [
  { id: 'description', label: '상품설명' },
  { id: 'spec', label: '상세정보' },
  { id: 'review', label: '후기 3,000' },
  { id: 'qna', label: '문의' },
];

/** 실시간 구매정보 토스트 노출 시간 — Figma(node 665-43179)는 정적이라 소멸 타이밍
 * 미지정. CheckoutView 의 검증 토스트(5초, VALIDATION_TOAST_DURATION_MS)와 같은 이유로
 * 임시값 — 디자인 확인 필요. 실기기 확인 피드백으로 4초 → 3초 조정. */
const PURCHASE_INFO_TOAST_DURATION_MS = 3000;

/** 미션 완료 토스트 노출 시간 — 마찬가지로 Figma 미지정, CheckoutView 검증 토스트(5초)
 * 선례를 따른 임시값. */
const MISSION_TOAST_DURATION_MS = 5000;

export interface ProductDetailInteractiveShellProps {
  /** 상세 조회 대상 상품 ID — 이 컴포넌트가 직접 `useProductDetail` 로 데이터를 소유한다
   * (헤더 타이틀·CTA 분기·토스트가 모두 이 데이터에 의존해 RSC 부모가 미리 내려줄 수 없다). */
  productId: string;
  /** "상품설명" 탭의 정적 콘텐츠(`ProductDescriptionContent`) — RSC 부모(`ProductDetailView`)가
   * 서버에서 미리 렌더해 내려준다. 대표 이미지+`ProductOverviewCard`(실 데이터 의존)는
   * 이 컴포넌트가 직접 그 앞에 렌더한다. */
  descriptionSlot: ReactNode;
  /** "상세정보" 탭 콘텐츠. */
  specSlot: ReactNode;
  /** "후기" 탭 콘텐츠. */
  reviewSlot: ReactNode;
}

/**
 * 상품 상세 화면의 상호작용 셸 (organism, client). Figma "5팀 UI 공유용" node 665-43030.
 *
 * 탭 제어·좋아요·바텀시트·toast 등 실제 상태를 가진 부분만 여기 있다 — 대표 이미지·개요·
 * 설명·상세정보·후기 같은 무거운 정적 콘텐츠는 `ProductDetailView`(RSC 셸)가 서버에서
 * 미리 렌더해 `descriptionSlot`/`specSlot`/`reviewSlot` props 로 내려준다(코드래빗 리뷰
 * 반영 — 예전엔 이 화면 전체가 `'use client'` 라 저 무거운 정적 콘텐츠까지 전부 클라
 * 번들에 포함돼 있었다, #101 QA). "문의" 탭(`InquiryTab`)은 슬롯으로 안 받고 여기서
 * 직접 렌더한다 — 그 탭의 비밀글 알림 모달이 `inquiryModalOpen`(이 컴포넌트가 소유한
 * 상태) 을 통해 헤더/CTA 바의 포인터 이벤트를 잠가야 하는데, 그 콜백(`setInquiryModalOpen`)
 * 은 함수라 RSC 부모가 props 로 내려줄 수 없다 — 상태를 쓰는 컴포넌트는 그 상태를 소유한
 * 클라 경계 안에서 직접 렌더해야 한다.
 */
export function ProductDetailInteractiveShell({
  productId,
  descriptionSlot,
  specSlot,
  reviewSlot,
}: ProductDetailInteractiveShellProps) {
  const router = useRouter();
  const { data: detail, isPending, isError } = useProductDetail(productId);
  const overview = detail
    ? toProductDetailOverview(detail, MOCK_STATIC_OVERVIEW_FIELDS)
    : undefined;
  const [activeTab, setActiveTab] = useState('description');
  const [liked, setLiked] = useState(false);
  const [optionSheetOpen, setOptionSheetOpen] = useState(false);
  const [multiOptionSheetOpen, setMultiOptionSheetOpen] = useState(false);
  const [cartAddedSheetOpen, setCartAddedSheetOpen] = useState(false);
  const [showMissionToast, setShowMissionToast] = useState(false);
  const scrollTopVisible = useScrollToTopVisibility();
  const [showPurchaseInfoToast, setShowPurchaseInfoToast] = useState(true);
  const missionToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // "문의" 탭 비밀글 알림이 열려 있는 동안 헤더/CTA 바의 포인터 이벤트를 막는다 —
  // 그 두 요소는 딤 오버레이보다 위(z-30)라 시각적으로는 밝지만, 막지 않으면 모달이
  // 열린 채로도 뒤로가기/장바구니/CTA 를 누를 수 있다(코드래빗 리뷰 반영).
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  const hasPurchaseInfo = overview?.recentRepurchaseCount !== undefined;
  const isSoldOut = detail?.status === 'SOLDOUT';
  const unitCount = detail?.units.length ?? 0;

  useEffect(() => {
    if (!hasPurchaseInfo) return;
    const timer = setTimeout(
      () => setShowPurchaseInfoToast(false),
      PURCHASE_INFO_TOAST_DURATION_MS,
    );
    return () => clearTimeout(timer);
  }, [hasPurchaseInfo]);

  // 다시 담기로 첫 timer 만료 전에 재호출되면 이전 timer 가 새 토스트를 먼저 숨겨버려서
  // ref 로 들고 있다가 매번 clearTimeout 부터 한다. 언마운트 시에도 정리.
  useEffect(() => {
    return () => {
      if (missionToastTimerRef.current) clearTimeout(missionToastTimerRef.current);
    };
  }, []);

  // 장바구니 담기 완료 시트(node 665:43409) — 단일/다중 옵션 시트 둘 다 성공 시 여기로
  // 모인다. 미션 리워드(node 665:43410)가 있으면 상단 토스트도 함께 띄운다.
  function handleAddedToCart() {
    setCartAddedSheetOpen(true);
    if (!overview?.missionReward) return;
    if (missionToastTimerRef.current) clearTimeout(missionToastTimerRef.current);
    setShowMissionToast(true);
    missionToastTimerRef.current = setTimeout(
      () => setShowMissionToast(false),
      MISSION_TOAST_DURATION_MS,
    );
  }

  // 대표 이미지+`ProductOverviewCard`는 실 데이터(useProductDetail)에 의존해 로딩/에러 분기가
  // 필요하다 — 정적 콘텐츠(`descriptionSlot`)와 달리 이 컴포넌트가 직접 렌더한다.
  // 로딩/에러 표현은 `ProductGrid`(검색 결과 그리드)의 기존 패턴을 그대로 따른다.
  const overviewSection = isPending ? (
    <p className="text-label-m text-fg-tertiary w-full px-4 py-8 text-center">
      상품 정보를 불러오는 중이에요
    </p>
  ) : isError || !overview ? (
    <ErrorState
      className="px-4 py-8"
      icon={<Icon name="alert" size={56} aria-hidden />}
      title="상품 정보를 불러오지 못했어요"
      description="잠시 후 다시 시도해주세요"
    />
  ) : (
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
    </>
  );

  // "상세정보" 탭용 보관방법/포장타입(이슈 #134) — product-service 응답의 `spec`을 그대로
  // 쓴다. `ProductDetailTable`(상품정보제공고시, 법정 고지 표)과는 다른 데이터라 그 표는
  // 그대로 두고, 같은 라벨/값 2열 표 스타일만 재사용해 그 앞에 별도로 얹는다.
  const specSection = detail?.spec ? (
    <div className="border-border rounded-m mx-4 my-3 overflow-hidden border">
      <div className="flex w-full">
        <div className="bg-border flex w-31.5 shrink-0 items-center p-3">
          <p className="text-body-m text-fg">보관방법</p>
        </div>
        <div className="border-border flex min-w-0 flex-1 items-center border-l p-3">
          <p className="text-label-m text-fg-tertiary">
            {STORAGE_TYPE_LABEL[detail.spec.storageType]}
          </p>
        </div>
      </div>
      <div className="border-border flex w-full border-t">
        <div className="bg-border flex w-31.5 shrink-0 items-center p-3">
          <p className="text-body-m text-fg">포장타입</p>
        </div>
        <div className="border-border flex min-w-0 flex-1 items-center border-l p-3">
          <p className="text-label-m text-fg-tertiary">
            {PACKAGING_TYPE_LABEL[detail.spec.packagingType]}
          </p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div
        className={`bg-surface sticky top-0 z-30 ${inquiryModalOpen ? 'pointer-events-none' : ''}`}
      >
        <SectionHeader
          leading="back"
          onLeadingClick={() => router.back()}
          title={overview?.name}
          titleClassName="text-heading-2 text-fg"
          actions={[
            { icon: 'home', label: '홈으로 이동', href: '/' },
            { icon: 'cart', label: '장바구니로 이동', href: '/cart' },
          ]}
        />
        <TabBar
          tone="brand-secondary"
          size="md"
          fitted
          activeId={activeTab}
          onChange={setActiveTab}
          items={TABS}
        />
      </div>

      <div className="flex flex-1 flex-col">
        {activeTab === 'spec' ? (
          <>
            {specSection}
            {specSlot}
          </>
        ) : activeTab === 'review' ? (
          reviewSlot
        ) : activeTab === 'qna' ? (
          <InquiryTab onLockedAlertOpenChange={setInquiryModalOpen} />
        ) : (
          <>
            {overviewSection}
            {descriptionSlot}
          </>
        )}
      </div>

      {/* 노출 조건은 useScrollToTopVisibility 가 스크롤 방향/최상단·최하단으로 판정
          (디자인 핸드오프 스펙). 언마운트 대신 opacity 토글 — 트랜지션 애니메이션은
          prefers-reduced-motion 에서 자동으로 꺼진다(motion-reduce:transition-none,
          code-style §7). 숨김 상태에선 포인터/키보드 포커스도 함께 뺀다. */}
      <div
        className={`fixed inset-x-0 bottom-40 z-40 mx-auto flex max-w-screen-sm justify-end px-4 transition-opacity duration-200 motion-reduce:transition-none ${
          scrollTopVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <FloatingButton
          shape="icon"
          icon="scroll"
          aria-label="맨 위로 이동"
          tabIndex={scrollTopVisible ? 0 : -1}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        />
      </div>

      {/* 실시간 구매정보 토스트(node 665:43179) — CTA 바 위 16px, 가로 중앙 정렬.
          플로팅 스크롤 버튼과 같은 fixed 오버레이 레이어지만 가로 정렬이 달라(가운데 vs
          우측) 같은 화면에 함께 있어도 안 겹친다. 항상 마운트해두고 opacity 만 토글
          (top 검증 토스트와 동일 원칙 — 사라질 때도 트랜지션이 걸리게). */}
      {hasPurchaseInfo ? (
        <div
          aria-hidden={!showPurchaseInfoToast}
          className={`pointer-events-none fixed inset-x-0 bottom-41 z-40 flex justify-center px-4 transition-opacity duration-300 motion-reduce:transition-none ${
            showPurchaseInfoToast ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Toast
            icon={<Image src="/graphic-icons/toast-card.webp" alt="" width={20} height={20} />}
          >
            최근 3개월간 {overview?.recentRepurchaseCount?.toLocaleString('ko-KR')}명이{' '}
            <span className="text-brand-50">재구매했어요</span>
          </Toast>
        </div>
      ) : null}

      {/* z-30 은 헤더(위 SectionHeader+TabBar 래퍼)와 맞춘 값 — "문의" 탭의 비밀글
          알림 모달이 z-20 딤 오버레이로 이 CTA 바 밑에서 뜨므로(InquiryTab 참고),
          이 바가 항상 그 위에서 밝게 남아 있어야 한다. 모달이 열린 동안은
          pointer-events-none 으로 뒤에서 클릭이 통과되지 않게 막는다. */}
      <AddToCartActions
        promotion={{ text: '첫 구매니까, 하나만 사도 ', emphasisText: '무료배송' }}
        liked={liked}
        onToggleLike={() => setLiked((prev) => !prev)}
        showTerms={false}
        // SKU(units)가 정확히 1개면 단일 옵션 시트, 2개 이상이면 다중 옵션 시트를 연다
        // (코드래빗 리뷰 반영 — 전엔 mock뿐인 memberDeal로 분기해 0개 상품도 단일 시트가
        // 열려 수량 1로 가상 담기가 될 수 있었다). 0개면 담을 옵션이 없어 아무것도 안 한다.
        onAddToCart={() => {
          if (unitCount === 0) return;
          if (unitCount > 1) {
            setMultiOptionSheetOpen(true);
          } else {
            setOptionSheetOpen(true);
          }
        }}
        // 상품 데이터 로딩/에러 중엔 무엇을 담는지 알 수 없고, 품절 상품·옵션이 하나도
        // 없는 상품은 담을 수 없어 담기 자체를 막는다(이슈 #134 — `status`/`units` 연동).
        addToCartDisabled={!overview || isSoldOut || unitCount === 0}
        className={`bg-surface sticky bottom-0 z-30 ${inquiryModalOpen ? 'pointer-events-none' : ''}`}
      />

      {detail?.units[0] ? (
        <ProductOptionSheet
          open={optionSheetOpen}
          onClose={() => setOptionSheetOpen(false)}
          onAddToCart={handleAddedToCart}
          productName={overview?.name ?? ''}
          productTagline={detail.shortDescription}
          productImageSrc={overview?.imageSrc}
          unit={detail.units[0]}
        />
      ) : null}
      <MultiOptionSelectBottomSheet
        open={multiOptionSheetOpen}
        onClose={() => setMultiOptionSheetOpen(false)}
        onAddToCart={handleAddedToCart}
        productName={overview?.name ?? ''}
        productTagline={detail?.shortDescription ?? ''}
        productImageSrc={overview?.imageSrc}
        units={detail?.units ?? []}
      />
      <CartAddedProductsBottomSheet
        open={cartAddedSheetOpen}
        onClose={() => setCartAddedSheetOpen(false)}
      />

      {/* 미션 완료 토스트(node 665:43410) — 화면 최상단, CheckoutView 의 검증 에러
          토스트와 같은 원칙(상시 마운트 + translate-y 토글, top-16.5=66px 는 Figma
          실측 그대로). z-50(백드롭과 동일 레벨)이면 BottomSheet 백드롭이 mount 순서에
          따라 위로 덮여 토스트가 탁하게 보였다(실기기 QA 발견) — z-toast(60, globals.css)
          로 항상 위에 오도록 고정. */}
      {overview?.missionReward ? (
        <div
          aria-hidden={!showMissionToast}
          className={[
            'z-toast pointer-events-none fixed inset-x-0 top-16.5 flex justify-center px-4',
            'transition-transform duration-300 ease-out motion-reduce:transition-none',
            showMissionToast ? 'translate-y-0' : '-translate-y-50',
          ].join(' ')}
        >
          <MissionCompleteCard
            pointsLabel={overview.missionReward.pointsLabel}
            description={overview.missionReward.description}
            className="pointer-events-auto"
          />
        </div>
      ) : null}
    </>
  );
}
