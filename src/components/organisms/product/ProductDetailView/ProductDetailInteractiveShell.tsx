'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Toast } from '@/components/atoms/Toast';
import { AddToCartActions } from '@/components/molecules/product/AddToCartActions';
import { MissionCompleteCard } from '@/components/molecules/shared/MissionCompleteCard';
import { TabBar, type TabBarItem } from '@/components/molecules/shared/TabBar';
import { CartAddedProductsBottomSheet } from '@/components/organisms/product/CartAddedProductsBottomSheet';
import { InquiryTab } from '@/components/organisms/product/InquiryTab';
import type { ProductDetailOverview } from '@/components/organisms/product/model';
import { MultiOptionSelectBottomSheet } from '@/components/organisms/product/MultiOptionSelectBottomSheet';
import { ProductOptionSheet } from '@/components/organisms/product/ProductOptionSheet';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
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
  overview: ProductDetailOverview;
  /** "상품설명" 탭 콘텐츠(대표 이미지+개요+설명) — RSC 부모(`ProductDetailView`)가
   * 서버에서 미리 렌더해 내려준다. */
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
  overview,
  descriptionSlot,
  specSlot,
  reviewSlot,
}: ProductDetailInteractiveShellProps) {
  const router = useRouter();
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

  const hasPurchaseInfo = overview.recentRepurchaseCount !== undefined;

  // 디자인 QA(#132): 상품설명을 스크롤한 채 다른 탭으로 전환하면 전환된 콘텐츠가
  // 이전 스크롤 위치 그대로 보였다 — 탭 전환 시 최상단(헤더 바로 아래)부터 보이도록
  // 스크롤을 되돌린다. 헤더+탭바가 이 셸의 첫 자식(sticky top-0)이라 top:0 이 곧
  // "헤더 아래에서 콘텐츠 시작" 위치와 같다.
  function handleTabChange(id: string) {
    setActiveTab(id);
    window.scrollTo({ top: 0 });
  }

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
    if (!overview.missionReward) return;
    if (missionToastTimerRef.current) clearTimeout(missionToastTimerRef.current);
    setShowMissionToast(true);
    missionToastTimerRef.current = setTimeout(
      () => setShowMissionToast(false),
      MISSION_TOAST_DURATION_MS,
    );
  }

  return (
    <>
      <div
        className={`bg-surface sticky top-0 z-30 ${inquiryModalOpen ? 'pointer-events-none' : ''}`}
      >
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
          onChange={handleTabChange}
          items={TABS}
        />
      </div>

      <div className="flex flex-1 flex-col">
        {activeTab === 'spec' ? (
          specSlot
        ) : activeTab === 'review' ? (
          reviewSlot
        ) : activeTab === 'qna' ? (
          <InquiryTab onLockedAlertOpenChange={setInquiryModalOpen} />
        ) : (
          descriptionSlot
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
          이 바가 항상 그 위에서 밝게 남아 있어야 한다. 모달이 열린 동안은
          pointer-events-none 으로 뒤에서 클릭이 통과되지 않게 막는다. */}
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
        className={`bg-surface sticky bottom-0 z-30 ${inquiryModalOpen ? 'pointer-events-none' : ''}`}
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
