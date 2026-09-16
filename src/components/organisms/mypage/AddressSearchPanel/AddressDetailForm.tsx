'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { InfoBox } from '@/components/atoms/InfoBox';
import { Input } from '@/components/atoms/Input';
import { Radio } from '@/components/atoms/Radio';
import { AddressChip, type AddressType } from '@/components/molecules/address/AddressChip';
import { Modal } from '@/components/molecules/shared/Modal';
import { AddressDetailFormSchema, type AddressDetailFormFields } from '@/types/address';

import type { AddressFormValues } from '../model';

/**
 * 새 배송지 "추가" 시 나머지 정보를 입력하는 화면(organism 하위 파트) — Figma node 666-25887.
 *
 * `AddressSearchPanel` 이 카카오 우편번호 위젯으로 도로명 주소를 고른 뒤(추가 흐름에서만)
 * 렌더한다. 기존 `AddressForm`(수정 전용, node 359-15314/15527)과 형제 컴포넌트지만 구성이
 * 다르다 — 사용자 확인(2026-09-14):
 * - "받으실 분"/"휴대폰" 입력이 없다 — 저장 시 로그인한 사용자 기본정보를 자동으로 채운다
 *   (실제 사용자 프로필 API 연동 전까지 체크아웃 `MOCK_CUSTOMER` 와 동일한 목업 인물 재사용).
 * - "샛별배송 지역입니다" 배너 + 서비스 제한 안내박스가 있다 — 배송 가능 지역을 판정하는
 *   백엔드가 없어(프로젝트 전역에서 `deliveryType` 이 항상 "샛별배송" 고정값인 것과 같은
 *   이유) 항상 고정 노출한다.
 * - "기본 배송지로 저장" 토글이 추가 흐름에서도 노출된다(기존 `AddressForm` 은 수정 시에만
 *   노출) — 기본값 체크(Figma 스크린샷)이며, 첫 배송지(`willBeDefault`)면 토글과 무관하게
 *   기본배송지로 저장된다(그 외엔 없어질 기본배송지가 생기는 걸 막기 위함).
 * - "나머지 주소"는 선택 입력이다 — 비워도 저장 자체는 막히지 않는다(피드백 원문: "나머지
 *   주소를 작성하지 않아도 저장이 됩니다"). 다만 비운 채 "저장"을 누르면 확인 모달
 *   (node 666-25967 "상세주소 입력")을 한 번 거친다 — "확인"을 눌러야 실제로 저장된다.
 *
 * `우리집`·`회사` 유형칩 유일성 규칙과 변경 확인 모달(node 359-15631)은 `AddressForm` 과
 * 동일하게 유지한다 — 배송지당 유일해야 하는 도메인 규칙 자체는 추가/수정 흐름이 다르지 않다.
 */
const ALIAS_LABEL: Record<AddressType, string> = {
  home: '우리집',
  company: '회사',
  custom: '직접입력',
};

/** 실제 사용자 프로필 API 연동 전까지의 "로그인한 사용자" 목업 — 체크아웃 MOCK_CUSTOMER 와 동일 인물. */
const MOCK_CURRENT_USER = { recipient: '이준호', phone: '01012341234' };

export interface AddressDetailFormProps {
  /** 위젯이 고른 우편번호·도로명. */
  address: { zonecode: string; roadAddress: string };
  /** 다른 배송지가 이미 쓰는 유형칩 — 선택 시 변경 확인 모달. */
  usedAliases: AddressType[];
  /** 이 배송지가 기본배송지가 되는지(첫 배송지). 토글과 무관하게 강제된다. */
  willBeDefault: boolean;
  onSubmit: (values: AddressFormValues) => void;
}

export function AddressDetailForm({
  address,
  usedAliases,
  willBeDefault,
  onSubmit,
}: AddressDetailFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { isSubmitting },
  } = useForm<AddressDetailFormFields>({
    resolver: zodResolver(AddressDetailFormSchema),
    mode: 'onTouched',
    defaultValues: {
      zonecode: address.zonecode,
      roadAddress: address.roadAddress,
      detailAddress: '',
      aliasType: undefined,
      customAlias: '',
      saveAsDefault: true,
    },
  });

  // watch() 함수는 React Compiler 가 메모이즈 못 해 경고 → 훅 형태(useWatch)로 구독한다.
  const aliasType = useWatch({ control, name: 'aliasType' });
  const saveAsDefault = useWatch({ control, name: 'saveAsDefault' });

  /** 변경 확인 모달 대상(우리집/회사). null 이면 닫힘. */
  const [aliasConflict, setAliasConflict] = useState<'home' | 'company' | null>(null);

  /** "나머지 주소" 빈 채로 저장 시도한 값 — null 이면 확인 모달 닫힘(node 666-25967). */
  const [pendingFields, setPendingFields] = useState<AddressDetailFormFields | null>(null);

  function pickAlias(type: AddressType) {
    if (
      (type === 'home' || type === 'company') &&
      usedAliases.includes(type) &&
      aliasType !== type
    ) {
      setAliasConflict(type);
      return;
    }
    setValue('aliasType', type, { shouldDirty: true, shouldValidate: true });
  }

  function submitFields(fields: AddressDetailFormFields) {
    const name =
      fields.aliasType === 'custom'
        ? fields.customAlias.trim() || undefined
        : fields.aliasType
          ? ALIAS_LABEL[fields.aliasType]
          : undefined;

    onSubmit({
      aliasType: fields.aliasType,
      name,
      roadAddress: fields.roadAddress,
      detailAddress: fields.detailAddress.trim() || undefined,
      zonecode: fields.zonecode,
      recipient: MOCK_CURRENT_USER.recipient,
      phone: MOCK_CURRENT_USER.phone,
      deliveryType: '샛별배송',
      isDefault: willBeDefault || fields.saveAsDefault,
    });
  }

  // "나머지 주소"가 비어 있으면 바로 저장하지 않고 확인 모달부터 띄운다 — "확인"을
  // 눌러야 submitFields 가 불린다(node 666-25967).
  function onValid(fields: AddressDetailFormFields) {
    if (!fields.detailAddress.trim()) {
      setPendingFields(fields);
      return;
    }
    submitFields(fields);
  }

  return (
    <form onSubmit={handleSubmit(onValid)} className="flex min-h-0 flex-1 flex-col">
      {/* pt-14(56px) — '배송지' 헤더(AddressSearchPanel)와 이 배너 사이 거리 실측값을
          하드코딩 대신 Tailwind 숫자 스케일로(56÷4=14). */}
      <div className="flex flex-1 flex-col overflow-y-auto px-4 pt-14 pb-4">
        {/* 샛별배송 안내 — node 666-25889/25890/25891. gap-[7px] 는 Figma 실측(디자인 토큰
            스케일에 없는 값이라 임의값 유지). "샛별배송" 색상은 #690085 = Brand/500 =
            text-primary(이 프로젝트의 시맨틱 별칭). 부제는 Figma "Label/Label_L_SemiBold"
            (14px/600) — text-label-m(14px/500)이 아니다(재검증 전엔 굵기를 잘못 적었다). */}
        <div className="flex flex-col items-center gap-[7px] text-center">
          <p className="text-display-xs text-fg">
            <span className="text-primary">샛별배송</span> 지역입니다.
          </p>
          <p className="text-label-m text-fg-tertiary">매일 새벽, 문 앞까지 신선함을 전해드려요.</p>
        </div>

        {/* mt-15(60px) — 배너 부제와 아래 도로명 주소 사이 거리 실측값(하드코딩 대신
            60÷4=15). 안쪽 gap-5(20px)는 Figma node 666-25892("주소+Input+칩+토글" 묶음 ↔
            안내박스) 그대로. */}
        <div className="mt-15 flex flex-col gap-5">
          {/* node 666-25893 — gap-[9px] 는 Figma 실측 임의값. 안쪽 "주소+Input" 묶음(gap/s,
              12px)과는 다른 레벨이라 재검증 전엔 하나로 뭉뚱그려(gap-3) 셋 다 12px이 돼버렸었다. */}
          <div className="flex flex-col gap-[9px]">
            <div className="flex flex-col gap-3">
              <p className="text-heading-4 text-fg-secondary">{address.roadAddress}</p>

              <Input
                label="나머지 주소"
                placeholder="나머지 주소를 입력해주세요"
                {...register('detailAddress')}
              />
            </div>

            <div className="flex items-center justify-between">
              {(['home', 'company', 'custom'] as const).map((type) => (
                <AddressChip
                  key={type}
                  type={type}
                  label={ALIAS_LABEL[type]}
                  selected={aliasType === type}
                  onClick={() => pickAlias(type)}
                />
              ))}
            </div>

            {aliasType === 'custom' ? (
              <Input label="배송지 이름" {...register('customAlias')} />
            ) : null}

            {/* node 666-25901/25903 — 인디케이터는 AddressForm 과 동일하게 Radio check variant. */}
            <div className="flex items-center">
              <Radio
                variant="check"
                tone="purple"
                label="기본 배송지로 저장"
                checked={saveAsDefault}
                readOnly
                onClick={() => setValue('saveAsDefault', !saveAsDefault, { shouldDirty: true })}
              />
              <span aria-hidden className="text-heading-5 text-fg">
                기본 배송지로 저장
              </span>
            </div>
          </div>

          {/* node 666-25905 — 서비스 제한 안내. InfoBox 공용 atom 자체 자간(0)은 다른 곳에도
              쓰이니 그대로 두고, 이 문구만 tracking-[0.01em](text-label-s 자간)으로 감싼다 —
              그래야 Figma 그대로 정확히 2줄로 줄바꿈된다(자간 0인 채로는 줄바꿈 지점이 달라짐).
              아이콘 색도 실측(#7e8f9b = fg-tertiary) — InfoBox 가 아이콘 슬롯에 색을 안 입혀서
              text-fg(#222, 진한 색)로 새고 있었다. */}
          <InfoBox
            variant="inline"
            icon={<Icon name="info-line" size={20} className="text-fg-tertiary" aria-hidden />}
          >
            <span className="tracking-[0.01em]">
              일부 관공서, 학교, 병원, 시장, 공단지역, 산간지역, 백화점 등은 현장 상황에 따라
              샛별배송이 불가능할 수 있습니다.
            </span>
          </InfoBox>
        </div>
      </div>

      {/* CTA_Horizontal (node 666-25919) — 상단 보더 없음. */}
      <div className="bg-surface shrink-0 px-4 pt-3 pb-11">
        <Button
          type="submit"
          variant="primary"
          size="l"
          disabled={isSubmitting}
          className="h-14 w-full"
        >
          저장
        </Button>
      </div>

      {aliasConflict !== null ? (
        <Modal
          open
          onClose={() => setAliasConflict(null)}
          title={`${ALIAS_LABEL[aliasConflict]}을 변경하시겠어요?`}
          description={`${ALIAS_LABEL[aliasConflict]}으로 등록된 주소지가 있습니다. 이 주소로 변경하시겠습니까?`}
          footer={
            <>
              <Button variant="outlineBlack" onClick={() => setAliasConflict(null)}>
                취소
              </Button>
              <Button
                variant="black"
                onClick={() => {
                  setValue('aliasType', aliasConflict, { shouldDirty: true, shouldValidate: true });
                  setAliasConflict(null);
                }}
              >
                확인
              </Button>
            </>
          }
        />
      ) : null}

      {/* node 666-25967 — "나머지 주소" 비운 채 저장 시도했을 때만 뜬다. */}
      <Modal
        open={pendingFields !== null}
        onClose={() => setPendingFields(null)}
        title="상세주소 입력"
        description="나머지 주소를 입력하지 않으셨습니다. 이대로 저장하시겠습니까?"
        footer={
          <>
            <Button variant="outlineBlack" onClick={() => setPendingFields(null)}>
              취소
            </Button>
            <Button
              variant="black"
              onClick={() => {
                if (pendingFields) submitFields(pendingFields);
                setPendingFields(null);
              }}
            >
              확인
            </Button>
          </>
        }
      />
    </form>
  );
}
