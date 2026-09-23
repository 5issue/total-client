'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/Button';
import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Icon } from '@/components/atoms/Icon';
import { LoadingIndicator } from '@/components/atoms/LoadingIndicator';
import { AddressListItem } from '@/components/molecules/address/AddressListItem';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import { Modal } from '@/components/molecules/shared/Modal';
import {
  AddressSearchPanel,
  type AddressFormValues,
} from '@/components/organisms/mypage/AddressSearchPanel';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useAddresses } from '@/hooks/address/useAddresses';
import { useCreateAddress } from '@/hooks/address/useCreateAddress';
import { useDeleteAddress } from '@/hooks/address/useDeleteAddress';
import { useUpdateAddress } from '@/hooks/address/useUpdateAddress';
import { useDeliveryAddressStore } from '@/hooks/useDeliveryAddressStore';

import { mapAddressToView, mapFormValuesToSaveRequest } from './mapAddressResponse';

/**
 * 배송지 관리 화면 컨테이너 (organism). Figma "5팀 UI 공유용" — node 359-15270(빈) / 359-15286·15669(목록).
 *
 * 장바구니 상단 `CartDeliveryAddress` "추가"/"변경" 진입점. 목록은 `useAddresses`(TanStack
 * Query)에서 온다 — `CartView` 도 같은 쿼리 키를 쓰므로 캐시를 공유한다(이슈 #119). 선택된
 * 배송지 id 만 `deliveryAddressStore`(Zustand, 순수 클라 상태)에 남아있다 — 목록 자체를
 * 스토어에 두면 서버 응답을 전역 스토어에 복사하는 안티패턴이 된다(api-convention).
 *
 * - 라디오 선택(`selectedId`)은 **사용자만 바꾼다** — 기본배송지 설정/추가가 선택을 옮기지 않는다.
 * - `우리집`·`회사` 유형칩·기본배송지 유일성은 이제 서버가 보장한다(저장 성공 후 재조회로 반영).
 * - `삭제` 는 배송지가 2개 이상이고 **기본배송지가 아닐 때만** 노출(node 359-15460). 삭제 전 확인 모달(node 359-15494).
 *
 * CTA 여백은 Figma `CTA_Horizontal`(node 359-15285) 실측. 상단 보더는 이 화면엔 없다.
 */
export function AddressManageView() {
  const router = useRouter();

  const addressesQuery = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddressMutation = useUpdateAddress();
  const deleteAddressMutation = useDeleteAddress();

  const selectedId = useDeliveryAddressStore((s) => s.selectedId);
  const setSelectedId = useDeliveryAddressStore((s) => s.setSelectedId);

  const [panel, setPanel] = useState<{ mode: 'add' } | { mode: 'edit'; id: string } | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  if (addressesQuery.isLoading) {
    return (
      <div className="flex flex-1 flex-col">
        <SectionHeader leading="back" onLeadingClick={() => router.back()} title="배송지 관리" />
        <LoadingIndicator className="flex-1" />
      </div>
    );
  }

  if (addressesQuery.isError || !addressesQuery.data) {
    return (
      <div className="flex flex-1 flex-col">
        <SectionHeader leading="back" onLeadingClick={() => router.back()} title="배송지 관리" />
        <div className="flex flex-1 flex-col items-center justify-center">
          <ErrorState
            icon={<Icon name="alert" size={56} aria-hidden />}
            title="배송지 목록을 불러오지 못했어요"
            description="잠시 후 다시 시도해주세요"
            action={
              <FloatingButton icon="refresh" onClick={() => void addressesQuery.refetch()}>
                다시 시도
              </FloatingButton>
            }
          />
        </div>
      </div>
    );
  }

  const addresses = addressesQuery.data.addresses.map(mapAddressToView);

  function addAddress(values: AddressFormValues) {
    createAddress.mutate(mapFormValuesToSaveRequest(values), {
      onSuccess: (created) => {
        // 첫 배송지일 때만 라디오를 잡아준다 — 그 외에는 사용자가 직접 선택(기본배송지 설정 무관).
        setSelectedId((cur) => cur ?? String(created.addressId));
      },
    });
    setPanel(null);
  }

  function updateAddress(id: string, values: AddressFormValues) {
    updateAddressMutation.mutate({
      addressId: Number(id),
      body: mapFormValuesToSaveRequest(values),
    });
    setPanel(null);
  }

  function deleteAddress(id: string) {
    // 삭제 대상이 지금 선택돼 있었다면 null 로 비우지 않고 남은 기본 배송지로 되돌린다 —
    // 그래야 목록엔 유효한 배송지가 남아있는데 장바구니만 "미선택"으로 보이는 어색한 상태를 피한다.
    const fallbackId = addresses.find((a) => a.id !== id && a.isDefault)?.id ?? null;
    deleteAddressMutation.mutate(Number(id));
    setSelectedId((cur) => (cur === id ? fallbackId : cur));
    setDeleteTargetId(null);
  }

  const editing = panel?.mode === 'edit' ? addresses.find((a) => a.id === panel.id) : undefined;
  const isEmpty = addresses.length === 0;

  /** 편집 대상을 뺀 나머지가 쓰고 있는 유형칩 — 패널에 넘겨 변경 확인 모달용. */
  const usedAliases = addresses
    .filter((a) => a.id !== editing?.id)
    .map((a) => a.aliasType)
    .filter((t): t is 'home' | 'company' => t === 'home' || t === 'company');

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
          {/* node 359-15302: full-bleed 회색 안내바.
              피드백(Figma QA #129): text-label-m 기본 굵기(500)가 진해 보인다는 지적 —
              font-normal(400)로 한 단계 낮춘다. */}
          <div className="bg-surface-secondary text-label-m text-fg-tertiary flex items-center gap-1 px-4 py-3 font-normal">
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
