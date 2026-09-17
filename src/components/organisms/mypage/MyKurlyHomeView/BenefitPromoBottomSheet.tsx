'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/atoms/Button';
import { BottomSheet } from '@/components/molecules/shared/BottomSheet';
import { useThemeStore } from '@/hooks/useThemeStore';

/**
 * PromoBannerBottomSheet(node 1233-114124) — 혜택 알림(마케팅 수신) 동의 유도 바텀시트.
 * `molecules/shared/BottomSheet`가 포커스 트랩·스크롤 잠금·닫기 동작을 이미 구현해 그대로 재사용.
 *
 * Figma CTA 라벨은 "장바구니 담기"인데 이 시트 맥락(광고성 정보 수신 동의)과 전혀
 * 안 맞아 다른 컴포넌트 재사용 중 복붙된 것으로 보여 "혜택 알림 동의하기"로 바꿨다
 * (코드래빗 리뷰 — 최종 문구는 디자인 확인 후 Figma 코멘트로 갱신 예정, issue #106).
 * API 연동 전이라 그 버튼은 시트를 닫기만 한다.
 *
 * "30일 동안 보지 않기"는 라벨 그대로 실제 30일 억제를 구현한다(Figma 스펙, #111) —
 * 클릭 시각 + 30일을 `localStorage`에 저장하고, 마운트 시 그 시각이 아직 안 지났으면
 * 열지 않는다. SSR 은 `localStorage` 를 모르니 초기 state 는 항상 `true`(서버·클라
 * 첫 렌더 동일, hydration mismatch 방지)로 두고 `useEffect` 에서만 판단한다 — 이건
 * "state 를 prop 에서 파생"이 아니라 브라우저 저장소라는 외부 시스템과의 동기화라
 * `react-hooks/set-state-in-effect` 가 말하는 정당한 effect 용도에 해당한다.
 *
 * `open` state 를 여기로 내려서 이 컴포넌트만 클라이언트 경계다 — 부모 `MyKurlyHomeView`
 * 는 이 state 를 더 이상 갖지 않아 서버 컴포넌트로 유지된다(코드래빗 리뷰, #111).
 *
 * `BottomSheet` 는 `document.body` 포털이라 `ThemeScope`(마이컬리 다크 스코프) 밖으로
 * 나간다 — 이 화면 전용 테마를 `theme` prop 으로 넘겨 포털 루트에서 스코프를 복원한다
 * (Figma 다크 프레임엔 이 바텀시트 자체가 없어 별도 스펙은 없고, 화면 나머지와 같은
 * 시맨틱 토큰을 그대로 재사용).
 */
const DISMISS_STORAGE_KEY = 'benefit-promo-dismissed-until';
const DISMISS_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

function isDismissed(): boolean {
  const dismissedUntil = Number(localStorage.getItem(DISMISS_STORAGE_KEY));
  return Number.isFinite(dismissedUntil) && Date.now() < dismissedUntil;
}

export function BenefitPromoBottomSheet() {
  const theme = useThemeStore((s) => s.theme);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    // localStorage 는 SSR 에 없는 외부 시스템이라 마운트 후에만 읽을 수 있다 — prop
    // 파생이 아니라 정당한 effect 용도(위 doc 참고).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isDismissed()) setOpen(false);
  }, []);

  function handleClose() {
    setOpen(false);
  }

  function handleDismissForMonth() {
    localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now() + DISMISS_DURATION_MS));
    setOpen(false);
  }

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      theme={theme}
      ariaLabel="혜택 알림 받고 저렴하게 구매하세요"
      footer={
        <div className="flex flex-col items-center px-4 pb-4">
          <Button variant="primary" size="l" className="h-14 w-full" onClick={handleClose}>
            혜택 알림 동의하기
          </Button>
          <button
            type="button"
            className="text-label-xl text-fg-secondary flex h-12.5 w-full items-center justify-center"
            onClick={handleDismissForMonth}
          >
            30일 동안 보지 않기
          </button>
        </div>
      }
    >
      {/* px-6: 텍스트만 CTA 버튼보다 8px 더 안쪽 여백(Figma 실측). */}
      <div className="flex flex-col gap-3 px-6 pt-2 pb-3">
        <div className="text-heading-1 text-fg">
          <p>혜택 알림 받고</p>
          <p>저렴하게 구매하세요!</p>
        </div>
        <div className="text-label-m text-fg-secondary">
          <p>지금 광고성 정보 수신에 동의하시면, 새로운 할인 쿠폰 및 특가</p>
          <p>소식 등을 누구보다 빠르게 받아볼 수 있어요.</p>
        </div>
      </div>
    </BottomSheet>
  );
}
