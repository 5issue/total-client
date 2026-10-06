import type { ReactNode } from 'react';

import { Toast } from '@/components/atoms/Toast';

/**
 * 화면 상단에서 슬라이드로 나타났다 사라지는 에러 토스트 배너 (molecule).
 * `CheckoutView`의 "배송 상세정보를 입력해주세요." 토스트에서 추출 — fetch 실패 등
 * 에러 메시지를 보여줘야 하는 다른 화면(`OrderCompleteContainer` 등)과 모양을 통일한다.
 * `useTimedToast` 로 노출 시간을 관리하는 호출부가 `visible` 을 넘긴다.
 *
 * `OrderHistoryView` 등의 하단 "action" 토스트(성공 확인용, 다른 위치·변형)와는 다른
 * 용도라 공용화하지 않았다 — 이건 상단 에러 배너 전용.
 */
export function ErrorToastBanner({ visible, children }: { visible: boolean; children: ReactNode }) {
  return (
    <div
      aria-hidden={!visible}
      className={[
        'pointer-events-none fixed inset-x-0 top-21 z-50 flex justify-center px-4',
        'transition-transform duration-300 ease-out motion-reduce:transition-none',
        visible ? 'translate-y-0' : '-translate-y-50',
      ].join(' ')}
    >
      <Toast variant="error">{children}</Toast>
    </div>
  );
}
