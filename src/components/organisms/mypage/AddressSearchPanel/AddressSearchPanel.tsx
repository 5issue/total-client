'use client';

import { useEffect, useRef, useState } from 'react';

import { Icon } from '@/components/atoms/Icon';
import { type AddressType } from '@/components/molecules/address/AddressChip';
import { PostcodeSearch, type PostcodeResult } from '@/components/molecules/address/PostcodeSearch';
import { useFocusTrap } from '@/hooks/useFocusTrap';

import type { AddressFormValues, AddressView } from '../model';
import { AddressForm } from './AddressForm';

/**
 * 새 배송지 추가 / 수정 — 아래에서 올라오는 전체화면 패널 (organism). 컬리 앱 주소검색 패턴.
 *
 * `AddressManageView` 가 조건부로 마운트한다. 부분 바텀시트가 아니라 전체화면(`fixed inset-0`)이라
 * 카카오 위젯이 화면을 꽉 채운다 — 시트 위치 계산·스크롤 충돌 없음. 진입은 트랜지션이 아니라
 * **마운트 애니메이션**(`animate-slide-up`, globals.css) — 요소는 항상 제자리에 렌더되고
 * 애니메이션만 화면 밖에서 올라온다. 트랜지션이 안 터져 화면 밖에 멈추는 문제가 없다.
 *
 * - **추가**: `✕ 주소 검색`(카카오 위젯) → `← 배송지`(정보 폼, node 359-15314) → "저장"
 * - **수정**(`editing` 전달): 위젯 단계 건너뛰고 바로 폼(node 359-15527), 값 프리필, CTA "수정".
 *   기본배송지가 아니면 "기본 배송지로 저장" 토글 노출(node 359-15559).
 *
 * 접근성: `role="dialog"` + `useFocusTrap`(포커스 이동·Tab 순환·복원) + Esc 닫기 —
 * code-style §5. 폼 검증은 `AddressForm` 이 RHF + Zod 로 담당한다.
 *
 * 백엔드 없음 — 저장은 `AddressManageView` 로컬 state 에만.
 */
export type { AddressFormValues } from '../model';

export interface AddressSearchPanelProps {
  /** 수정 대상. 없으면 새 배송지 추가(위젯부터). */
  editing?: AddressView;
  /** 다른 배송지가 이미 쓰고 있는 유형칩(우리집/회사) — 선택 시 변경 확인 모달. */
  usedAliases?: AddressType[];
  onClose: () => void;
  onSubmit: (values: AddressFormValues) => void;
  /** 이 배송지가 기본배송지로 등록될지(첫 배송지). 폼 상단 뱃지 노출용. */
  willBeDefault?: boolean;
}

type PickedAddress = Pick<PostcodeResult, 'zonecode' | 'roadAddress'>;

export function AddressSearchPanel({
  editing,
  usedAliases = [],
  onClose,
  onSubmit,
  willBeDefault = true,
}: AddressSearchPanelProps) {
  const isEdit = editing != null;

  const [picked, setPicked] = useState<PickedAddress | null>(
    isEdit ? { zonecode: editing.zonecode, roadAddress: editing.roadAddress } : null,
  );

  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef);

  // 폼 단계에서 뒤로: 추가는 위젯으로, 수정은 목록으로(닫기).
  const backToWidget = !isEdit && picked !== null;
  const goBack = backToWidget ? () => setPicked(null) : onClose;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // 중첩 Modal 이 Esc 를 이미 처리(preventDefault)했으면 패널은 건너뛴다.
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      if (backToWidget) setPicked(null);
      else onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [backToWidget, onClose]);

  const atWidgetStep = !isEdit && picked === null;
  const showBadge = isEdit ? editing.isDefault : willBeDefault;
  const showSaveDefault = isEdit && !editing.isDefault;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? '배송지 수정' : '새 배송지 추가'}
      tabIndex={-1}
      className="bg-surface motion-safe:animate-slide-up fixed inset-0 z-50 mx-auto flex max-w-screen-sm flex-col focus:outline-none"
    >
      <header className="flex items-center py-1 pr-4 pl-2">
        <button
          type="button"
          onClick={goBack}
          aria-label={atWidgetStep ? '닫기' : '뒤로 가기'}
          className="inline-flex size-11 shrink-0 items-center justify-center"
        >
          <Icon name={atWidgetStep ? 'close' : 'arrow-left'} size={32} aria-hidden />
        </button>
        <h1 className="text-heading-0 text-fg flex-1 px-2">
          {picked === null ? '주소 검색' : '배송지'}
        </h1>
      </header>

      {picked === null ? (
        <PostcodeSearch className="min-h-0 flex-1" onComplete={setPicked} />
      ) : (
        <AddressForm
          address={picked}
          editing={editing}
          usedAliases={usedAliases}
          showBadge={showBadge}
          showSaveDefault={showSaveDefault}
          willBeDefault={willBeDefault}
          onSubmit={onSubmit}
        />
      )}
    </div>
  );
}
