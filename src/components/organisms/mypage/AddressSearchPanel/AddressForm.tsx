'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Radio } from '@/components/atoms/Radio';
import { AddressChip, type AddressType } from '@/components/molecules/address/AddressChip';
import { Modal } from '@/components/molecules/shared/Modal';
import { AddressFormSchema, type AddressFormFields, normalizePhone } from '@/types/address';

import type { AddressFormValues, AddressView } from '../model';

/**
 * 배송지 정보 입력 폼 (organism 하위 파트) — Figma node 359-15314/15527.
 *
 * `AddressSearchPanel` 이 우편번호를 고른 뒤(추가) 또는 바로(수정) 렌더한다. 폼 상태는
 * React Hook Form + `zodResolver(AddressFormSchema)` 로 관리한다(code-style §4, 수동
 * useState 폼 금지). 우편번호/도로명은 위젯 결과라 편집 불가 필드로 `defaultValues` 에만 싣는다.
 *
 * - 수정 모드: 원본과 달라진 게 있을 때만 CTA 활성(`isDirty`, node 359-15595 ↔ 15559).
 * - `우리집`·`회사` 칩이 다른 배송지에 이미 있으면 변경 확인 모달(node 359-15631).
 * - 휴대폰은 숫자만 추려 검증하고, 저장 값도 숫자만으로 정규화한다.
 */
const ALIAS_LABEL: Record<AddressType, string> = {
  home: '우리집',
  company: '회사',
  custom: '직접입력',
};

export interface AddressFormProps {
  /** 위젯이 고른(또는 수정 대상의) 우편번호·도로명. */
  address: { zonecode: string; roadAddress: string };
  /** 수정 대상. 없으면 추가. */
  editing?: AddressView;
  /** 다른 배송지가 이미 쓰는 유형칩 — 선택 시 변경 확인 모달. */
  usedAliases: AddressType[];
  /** 상단 "기본배송지" 뱃지 노출. */
  showBadge: boolean;
  /** "기본 배송지로 저장" 토글 노출(기본배송지가 아닌 배송지 수정 시). */
  showSaveDefault: boolean;
  /** 추가 시 이 배송지가 기본배송지가 되는지(첫 배송지). */
  willBeDefault: boolean;
  onSubmit: (values: AddressFormValues) => void;
}

export function AddressForm({
  address,
  editing,
  usedAliases,
  showBadge,
  showSaveDefault,
  willBeDefault,
  onSubmit,
}: AddressFormProps) {
  const isEdit = editing != null;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<AddressFormFields>({
    resolver: zodResolver(AddressFormSchema),
    mode: 'onTouched',
    defaultValues: {
      zonecode: address.zonecode,
      roadAddress: address.roadAddress,
      detailAddress: editing?.detailAddress ?? '',
      aliasType: editing?.aliasType,
      customAlias: editing?.aliasType === 'custom' ? (editing.name ?? '') : '',
      recipient: editing?.recipient ?? '',
      phone: editing?.phone ?? '',
      saveAsDefault: false,
    },
  });

  // watch() 함수는 React Compiler 가 메모이즈 못 해 경고 → 훅 형태(useWatch)로 구독한다.
  const aliasType = useWatch({ control, name: 'aliasType' });
  const saveAsDefault = useWatch({ control, name: 'saveAsDefault' });

  /** 변경 확인 모달 대상(우리집/회사). null 이면 닫힘. */
  const [aliasConflict, setAliasConflict] = useState<'home' | 'company' | null>(null);

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

  function onValid(fields: AddressFormFields) {
    const name =
      fields.aliasType === 'custom'
        ? fields.customAlias.trim() || undefined
        : fields.aliasType
          ? ALIAS_LABEL[fields.aliasType]
          : undefined;

    const isDefault = isEdit
      ? (editing?.isDefault ?? false) || fields.saveAsDefault
      : willBeDefault;

    onSubmit({
      aliasType: fields.aliasType,
      name,
      roadAddress: fields.roadAddress,
      detailAddress: fields.detailAddress.trim() || undefined,
      zonecode: fields.zonecode,
      recipient: fields.recipient.trim(),
      phone: normalizePhone(fields.phone),
      deliveryType: editing?.deliveryType ?? '샛별배송',
      isDefault,
    });
  }

  return (
    <form onSubmit={handleSubmit(onValid)} className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pt-3 pb-4">
        {/* 기본배송지 뱃지 + 도로명 주소 — Figma node 359-15317. */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            {showBadge ? (
              <span className="bg-surface-secondary text-caption-m text-fg-secondary inline-flex h-6 w-fit items-center rounded-full px-2">
                기본배송지
              </span>
            ) : null}
            <p className="text-heading-4 text-fg-secondary">{address.roadAddress}</p>
          </div>

          <Input
            label="상세주소"
            placeholder="상세주소 (동/호수 등)"
            {...register('detailAddress')}
          />

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
            <Input
              label="배송지 이름"
              placeholder="배송지 이름을 입력해주세요"
              error={errors.customAlias?.message}
              {...register('customAlias')}
            />
          ) : null}
        </div>

        <Input
          label="받으실 분"
          labelVisible
          error={errors.recipient?.message}
          {...register('recipient')}
        />

        <Input
          label="휴대폰"
          labelVisible
          inputMode="tel"
          placeholder="숫자만 입력"
          error={errors.phone?.message}
          {...register('phone')}
        />

        {showSaveDefault ? (
          // 인디케이터는 Figma "Radio_Check"(node 359-15580) = 프로젝트 `Radio` check variant.
          // boolean 토글이라 onChange(라디오는 해제 이벤트 없음) 대신 onClick 으로 켜고 끈다.
          <div className="flex items-center gap-1">
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
        ) : null}
      </div>

      {/* CTA_Horizontal (node 359-15332) — 상단 보더 없음. */}
      <div className="bg-surface shrink-0 px-4 pt-3 pb-11">
        <Button
          type="submit"
          variant="primary"
          size="l"
          disabled={(isEdit && !isDirty) || isSubmitting}
          className="h-14 w-full"
        >
          {isEdit ? '수정' : '저장'}
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
    </form>
  );
}
