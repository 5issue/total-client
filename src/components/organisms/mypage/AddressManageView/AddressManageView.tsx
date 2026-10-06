'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/Button';
import { FloatingButton } from '@/components/atoms/FloatingButton';
import { Icon } from '@/components/atoms/Icon';
import { LoadingIndicator } from '@/components/atoms/LoadingIndicator';
import { AddressListItem } from '@/components/molecules/address/AddressListItem';
import { ErrorState } from '@/components/molecules/shared/ErrorState';
import { ErrorToastBanner } from '@/components/molecules/shared/ErrorToastBanner';
import {
  AddressSearchPanel,
  type AddressFormValues,
} from '@/components/organisms/mypage/AddressSearchPanel';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useAddresses } from '@/hooks/address/useAddresses';
import { useCreateAddress } from '@/hooks/address/useCreateAddress';
import { useUpdateCartDeliveryAddress } from '@/hooks/cart/useUpdateCartDeliveryAddress';
import { useDeliveryAddressStore } from '@/hooks/useDeliveryAddressStore';
import { useTimedToast } from '@/hooks/useTimedToast';

import { mapAddressToView, mapFormValuesToSaveRequest } from './mapAddressResponse';

const ADD_ADDRESS_ERROR_TOAST_DURATION_MS = 3000;
const ADD_ADDRESS_ERROR_MESSAGE = '배송지 추가에 실패했어요. 다시 시도해주세요.';

/**
 * 배송지 관리 화면 컨테이너 (organism). Figma "5팀 UI 공유용" — node 359-15270(빈) / 359-15286·15669(목록).
 *
 * 장바구니 상단 `CartDeliveryAddress` "추가"/"변경" 진입점. 목록은 `useAddresses`(TanStack
 * Query)에서 온다 — `CartView` 도 같은 쿼리 키를 쓰므로 캐시를 공유한다(이슈 #119). 선택된
 * 배송지 id 만 `deliveryAddressStore`(Zustand, 순수 클라 상태)에 남아있다 — 목록 자체를
 * 스토어에 두면 서버 응답을 전역 스토어에 복사하는 안티패턴이 된다(api-convention).
 * 라디오로 고를 때 장바구니 `PUT /delivery-address` 도 함께 호출한다 — `/cart` 가 언마운트된
 * 뒤 돌아오면 CartContainer 의 동기화 effect 만으로는 타이밍에 따라 반영이 늦거나, 스토어
 * 초기화(null → cart 캐시)가 사용자 선택을 덮어쓸 수 있어서, 선택 즉시 서버·쿼리 캐시를
 * 맞춘다(성공 시 useCart invalidate).
 *
 * - 라디오 선택(`selectedId`)은 **사용자만 바꾼다** — 기본배송지 설정/추가가 선택을 옮기지 않는다.
 * - `우리집`·`회사` 유형칩·기본배송지 유일성은 이제 서버가 보장한다(저장 성공 후 재조회로 반영).
 * - **수정·삭제는 이번 라운드에서 노출하지 않는다** — user-service `UserController`에 단건
 *   수정(PUT)·삭제(DELETE) 엔드포인트가 없다(types/address.ts 계약 노트, 2026-09-22 확인).
 *   `[addressId]/route.ts`는 그대로 두었지만(백엔드 추가 대비) 호출하면 항상 실패하므로,
 *   버튼 자체를 노출하지 않는다(CodeRabbit 리뷰 반영) — 목록 조회·추가만 이번 스코프.
 *
 * CTA 여백은 Figma `CTA_Horizontal`(node 359-15285) 실측. 상단 보더는 이 화면엔 없다.
 */
export function AddressManageView() {
  const router = useRouter();

  const addressesQuery = useAddresses();
  const createAddress = useCreateAddress();
  const updateCartDeliveryAddress = useUpdateCartDeliveryAddress();

  const selectedId = useDeliveryAddressStore((s) => s.selectedId);
  const setSelectedId = useDeliveryAddressStore((s) => s.setSelectedId);

  function selectDeliveryAddress(addressId: string) {
    setSelectedId(addressId);
    const numericId = Number(addressId);
    if (!Number.isInteger(numericId)) return;
    updateCartDeliveryAddress.mutate(numericId);
  }

  const [panel, setPanel] = useState<{ mode: 'add' } | null>(null);
  const { visible: addAddressErrorToastVisible, trigger: triggerAddAddressErrorToast } =
    useTimedToast(ADD_ADDRESS_ERROR_TOAST_DURATION_MS);

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

  /**
   * 뮤테이션이 성공했을 때만 패널을 닫는다 — 실패 직후 닫으면 React Hook Form 이 들고
   * 있던 입력값이 그대로 사라진다(CodeRabbit 리뷰 반영). 실패하면 패널은 그대로 두고
   * 토스트로만 알린다.
   */
  function addAddress(values: AddressFormValues) {
    createAddress.mutate(mapFormValuesToSaveRequest(values), {
      onSuccess: (created) => {
        // 첫 배송지일 때만 라디오를 잡아준다. selectedId 가 null 이어도 기존 목록이
        // 있으면(관리 화면 직접 진입) 새 주소로 선택을 옮기지 않는다.
        if (addresses.length === 0) {
          setSelectedId(String(created.addressId));
        }
        setPanel(null);
      },
      onError: () => {
        triggerAddAddressErrorToast();
      },
    });
  }

  const isEmpty = addresses.length === 0;

  const usedAliases = addresses
    .map((a) => a.aliasType)
    .filter((t): t is 'home' | 'company' => t === 'home' || t === 'company');

  return (
    <>
      <ErrorToastBanner visible={addAddressErrorToastVisible}>
        {ADD_ADDRESS_ERROR_MESSAGE}
      </ErrorToastBanner>
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
                  onSelect={() => selectDeliveryAddress(address.id)}
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
    </>
  );
}
