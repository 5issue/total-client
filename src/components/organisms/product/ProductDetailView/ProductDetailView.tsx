'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/atoms/Badge';
import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Toast } from '@/components/atoms/Toast';
import { AddToCartActions } from '@/components/molecules/product/AddToCartActions';
import { MissionCompleteCard } from '@/components/molecules/shared/MissionCompleteCard';
import { TabBar, type TabBarItem } from '@/components/molecules/shared/TabBar';
import { CartAddedProductsBottomSheet } from '@/components/organisms/product/CartAddedProductsBottomSheet';
import { InquiryTab } from '@/components/organisms/product/InquiryTab';
import { MultiOptionSelectBottomSheet } from '@/components/organisms/product/MultiOptionSelectBottomSheet';
import { ProductOptionSheet } from '@/components/organisms/product/ProductOptionSheet';
import { ProductOverviewCard } from '@/components/organisms/product/ProductOverviewCard';
import { ProductReviewTab } from '@/components/organisms/product/ProductReviewTab';
import { ProductSpecTab } from '@/components/organisms/product/ProductSpecTab';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useScrollToTopVisibility } from '@/hooks/useScrollToTopVisibility';

import { MOCK_PRODUCT_OVERVIEW } from './mock';

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

/**
 * 상품 상세 화면 컨테이너 (organism). Figma "5팀 UI 공유용" node 665-43030.
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
 */
export function ProductDetailView() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('description');
  const [liked, setLiked] = useState(false);
  const [optionSheetOpen, setOptionSheetOpen] = useState(false);
  const [multiOptionSheetOpen, setMultiOptionSheetOpen] = useState(false);
  const [cartAddedSheetOpen, setCartAddedSheetOpen] = useState(false);
  const [showMissionToast, setShowMissionToast] = useState(false);
  const scrollTopVisible = useScrollToTopVisibility();
  const [showPurchaseInfoToast, setShowPurchaseInfoToast] = useState(true);

  const overview = MOCK_PRODUCT_OVERVIEW;
  const hasPurchaseInfo = overview.recentRepurchaseCount !== undefined;

  useEffect(() => {
    if (!hasPurchaseInfo) return;
    const timer = setTimeout(
      () => setShowPurchaseInfoToast(false),
      PURCHASE_INFO_TOAST_DURATION_MS,
    );
    return () => clearTimeout(timer);
  }, [hasPurchaseInfo]);

  // 장바구니 담기 완료 시트(node 665:43409) — 단일/다중 옵션 시트 둘 다 성공 시 여기로
  // 모인다. 미션 리워드(node 665:43410)가 있으면 상단 토스트도 함께 띄운다.
  function handleAddedToCart() {
    setCartAddedSheetOpen(true);
    if (!overview.missionReward) return;
    setShowMissionToast(true);
    setTimeout(() => setShowMissionToast(false), MISSION_TOAST_DURATION_MS);
  }

  return (
    <>
      <div className="bg-surface sticky top-0 z-30">
        <SectionHeader
          leading="back"
          onLeadingClick={() => router.back()}
          title={overview.name}
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
          <ProductSpecTab />
        ) : activeTab === 'review' ? (
          <ProductReviewTab />
        ) : activeTab === 'qna' ? (
          <InquiryTab />
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
            최근 3개월간 {overview.recentRepurchaseCount?.toLocaleString('ko-KR')}명이{' '}
            <span className="text-brand-50">재구매했어요</span>
          </Toast>
        </div>
      ) : null}

      {/* z-30 은 헤더(위 SectionHeader+TabBar 래퍼)와 맞춘 값 — "문의" 탭의 비밀글
          알림 모달이 z-20 딤 오버레이로 이 CTA 바 밑에서 뜨므로(InquiryTab 참고),
          이 바가 항상 그 위에서 밝게 남아 있어야 한다. */}
      <AddToCartActions
        promotion={{ text: '첫 구매니까, 하나만 사도 ', emphasisText: '무료배송' }}
        liked={liked}
        onToggleLike={() => setLiked((prev) => !prev)}
        showTerms={false}
        // 멤버스특가(overview.memberDeal) 상품은 옵션이 멤버스 전용으로 갈릴 수 있어
        // 단일 옵션 시트 대신 다중 옵션 시트(멤버스 옵션은 + 클릭 시 그 시트 안에서
        // 가입 모달로 다시 가로채짐)를 연다 — 일반 상품은 기존 단일 옵션 시트 그대로.
        // (사용자 확인 2026-09-16)
        onAddToCart={() =>
          overview.memberDeal ? setMultiOptionSheetOpen(true) : setOptionSheetOpen(true)
        }
        className="bg-surface sticky bottom-0 z-30"
      />

      <ProductOptionSheet
        open={optionSheetOpen}
        onClose={() => setOptionSheetOpen(false)}
        onAddToCart={handleAddedToCart}
      />
      <MultiOptionSelectBottomSheet
        open={multiOptionSheetOpen}
        onClose={() => setMultiOptionSheetOpen(false)}
        onAddToCart={handleAddedToCart}
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
      {overview.missionReward ? (
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
