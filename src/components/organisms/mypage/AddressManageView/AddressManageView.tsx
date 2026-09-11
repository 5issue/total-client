'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import type { AddressType } from '@/components/molecules/address/AddressChip';
import { AddressListItem } from '@/components/molecules/address/AddressListItem';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import { Modal } from '@/components/molecules/shared/Modal';
import {
  AddressSearchPanel,
  type AddressFormValues,
} from '@/components/organisms/mypage/AddressSearchPanel';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useDeliveryAddressStore } from '@/hooks/useDeliveryAddressStore';

import type { AddressView } from '../model';

/**
 * 배송지 관리 화면 컨테이너 (organism). Figma "5팀 UI 공유용" — node 359-15270(빈) / 359-15286·15669(목록).
 *
 * 장바구니 상단 `CartDeliveryAddress` "추가"/"변경" 진입점. **퍼블리싱 단계** — 배송지 목록·선택은
 * 이 화면과 장바구니가 공유하는 `deliveryAddressStore`(클라 상태)에만 산다(백엔드 없음).
 * "새 배송지 추가"·항목 "수정"/"삭제"는 아래에서 올라오는 전체화면 `AddressSearchPanel` /
 * 인라인으로 반영되며, 새로고침하면 사라진다. CRUD 영속화는 데이터 연결 시.
 *
 * - 목록·선택을 이 컴포넌트 로컬 state 로 두면 라우트를 오갈 때마다(재마운트) 빈 목록으로
 *   되돌아가며 장바구니가 보던 기존 선택까지 지워버린다(코드래빗 리뷰) — 그래서 공유
 *   스토어가 소스 오브 트루스이고, 이 컴포넌트는 그 selector/액션만 쓴다.
 * - 라디오 선택(`selectedId`)은 **사용자만 바꾼다** — 기본배송지 설정/추가가 선택을 옮기지 않는다.
 * - `우리집`·`회사` 유형칩은 배송지당 유일 — 재지정하면 이전 배송지에서 제거.
 * - `isDefault` 도 유일 — 새 기본배송지 저장 시 이전 기본 해제.
 * - `삭제` 는 배송지가 2개 이상이고 **기본배송지가 아닐 때만** 노출(node 359-15460). 삭제 전 확인 모달(node 359-15494).
 *
 * CTA 여백은 Figma `CTA_Horizontal`(node 359-15285) 실측. 상단 보더는 이 화면엔 없다.
 */
function normalizeUnique(
  list: AddressView[],
  savedId: string,
  values: AddressFormValues,
): AddressView[] {
  const claimsAlias = values.aliasType === 'home' || values.aliasType === 'company';
  return list.map((a) => {
    if (a.id === savedId) return a;
    let next = a;
    if (values.isDefault && a.isDefault) next = { ...next, isDefault: false };
    if (claimsAlias && a.aliasType === values.aliasType) {
      next = { ...next, aliasType: undefined, name: undefined };
    }
    return next;
  });
}

export function AddressManageView() {
  const router = useRouter();

  // 목록·선택의 소스 오브 트루스는 장바구니와 공유하는 스토어다(이 컴포넌트 로컬에 두면
  // 재마운트마다 빈 목록으로 리셋되며 장바구니의 기존 선택까지 지워버린다).
  const addresses = useDeliveryAddressStore((s) => s.addresses);
  const setAddresses = useDeliveryAddressStore((s) => s.setAddresses);
  const selectedId = useDeliveryAddressStore((s) => s.selectedId);
  const setSelectedId = useDeliveryAddressStore((s) => s.setSelectedId);

  const [panel, setPanel] = useState<{ mode: 'add' } | { mode: 'edit'; id: string } | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  function addAddress(values: AddressFormValues) {
    const id = crypto.randomUUID();
    setAddresses((prev) => [...normalizeUnique(prev, id, values), { ...values, id }]);
    // 첫 배송지일 때만 라디오를 잡아준다 — 그 외에는 사용자가 직접 선택(기본배송지 설정 무관).
    setSelectedId((cur) => cur ?? id);
    setPanel(null);
  }

  function updateAddress(id: string, values: AddressFormValues) {
    setAddresses((prev) =>
      normalizeUnique(prev, id, values).map((a) => (a.id === id ? { ...a, ...values } : a)),
    );
    setPanel(null);
  }

  function deleteAddress(id: string) {
    // 삭제는 비-기본 배송지에서만 가능하다(기본배송지 승격 로직은 필요 없음). 다만 삭제 대상이
    // 지금 선택돼 있었다면 null 로 비우지 않고 남은 기본 배송지로 되돌린다 — 그래야 목록엔
    // 유효한 배송지가 남아있는데 장바구니만 "미선택"으로 보이는 어색한 상태를 피한다.
    const fallbackId = addresses.find((a) => a.id !== id && a.isDefault)?.id ?? null;
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    setSelectedId((cur) => (cur === id ? fallbackId : cur));
    setDeleteTargetId(null);
  }

  const editing = panel?.mode === 'edit' ? addresses.find((a) => a.id === panel.id) : undefined;
  const isEmpty = addresses.length === 0;

  /** 편집 대상을 뺀 나머지가 쓰고 있는 유형칩 — 패널에 넘겨 변경 확인 모달용. */
  const usedAliases = addresses
    .filter((a) => a.id !== editing?.id)
    .map((a) => a.aliasType)
    .filter((t): t is AddressType => t === 'home' || t === 'company');

  return (
    <>
      <SectionHeader leading="back" onLeadingClick={() => router.back()} title="배송지 관리" />

      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <ErrorState
            icon={<Icon name="alert" size={56} aria-hidden />}
            title="배송지를 추가해주세요"
          />
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-4 pb-4">
          {/* node 359-15302: full-bleed 회색 안내바. */}
          <div className="bg-surface-secondary text-label-m text-fg-tertiary flex items-center gap-1 px-4 py-3">
            <Icon name="info-line" size={20} aria-hidden />
            배송지에 따라 상품정보 및 배송유형이 달라질 수 있습니다.
          </div>

          <ul className="flex flex-col px-4">
            {addresses.map((address) => (
              <li
                key={address.id}
                className="border-border flex flex-col gap-3 border-b py-3 last:border-b-0"
              >
                <AddressListItem
                  aliasType={address.aliasType}
                  roadAddress={address.roadAddress}
                  detailAddress={address.detailAddress}
                  recipient={address.recipient}
                  phone={address.phone}
                  deliveryType={address.deliveryType}
                  isDefault={address.isDefault}
                  radioName="delivery-address"
                  selected={selectedId === address.id}
                  onSelect={() => setSelectedId(address.id)}
                  onEdit={() => setPanel({ mode: 'edit', id: address.id })}
                  // 삭제는 2개 이상 + 비-기본 배송지에서만(node 359-15460).
                  onDelete={
                    addresses.length > 1 && !address.isDefault
                      ? () => setDeleteTargetId(address.id)
                      : undefined
                  }
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-surface sticky bottom-0 flex flex-col px-4 pt-3 pb-11">
        <Button
          variant="outlineBlack"
          size="l"
          className="h-14 w-full"
          onClick={() => setPanel({ mode: 'add' })}
        >
          새 배송지 추가
        </Button>
      </div>

      {panel?.mode === 'add' && (
        <AddressSearchPanel
          usedAliases={usedAliases}
          onClose={() => setPanel(null)}
          onSubmit={addAddress}
          willBeDefault={addresses.length === 0}
        />
      )}
      {editing && (
        <AddressSearchPanel
          editing={editing}
          usedAliases={usedAliases}
          onClose={() => setPanel(null)}
          onSubmit={(values) => updateAddress(editing.id, values)}
        />
      )}

      <Modal
        open={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        title="배송지를 삭제하시겠어요?"
        description="배송지를 삭제하면 배송지 관리에서 확인할 수 없습니다."
        footer={
          <>
            <Button variant="outlineBlack" onClick={() => setDeleteTargetId(null)}>
              취소
            </Button>
            <Button variant="black" onClick={() => deleteTargetId && deleteAddress(deleteTargetId)}>
              확인
            </Button>
          </>
        }
      />
    </>
  );
}
