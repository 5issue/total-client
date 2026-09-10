'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { z } from 'zod';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Input } from '@/components/atoms/Input';
import { Radio } from '@/components/atoms/Radio';
import { AddressChip, type AddressType } from '@/components/molecules/address/AddressChip';
import { PostcodeSearch, type PostcodeResult } from '@/components/molecules/address/PostcodeSearch';
import { Modal } from '@/components/molecules/shared/Modal';

import type { AddressView } from '../model';

/**
 * 새 배송지 추가 / 수정 — 아래에서 올라오는 전체화면 패널 (organism). 컬리 앱 주소검색 패턴.
 *
 * `AddressManageView` 가 조건부로 마운트한다. 부분 바텀시트가 아니라 전체화면(`fixed inset-0`)이라
 * 카카오 위젯이 `flex-1` 로 화면을 꽉 채운다 — 시트 위치 계산·스크롤 충돌 없음. 진입은 트랜지션이
 * 아니라 **마운트 애니메이션**(`animate-slide-up`, globals.css) — 요소는 항상 제자리에 렌더되고
 * 애니메이션만 화면 밖에서 올라온다. 트랜지션이 안 터져 화면 밖에 멈추는 문제가 없다.
 *
 * - **추가**: `✕ 주소 검색`(카카오 위젯) → `← 배송지`(정보 폼, node 359-15314) → "저장"
 * - **수정**(`editing` 전달): 위젯 단계 건너뛰고 바로 폼(node 359-15527), 값 프리필, CTA "수정".
 *   기본배송지가 아니면 "기본 배송지로 저장" 토글 노출(node 359-15559). CTA 는 원본과
 *   달라진 게 있을 때만 활성(node 359-15595 비활성 vs 15559 활성).
 * - `우리집`·`회사` 칩이 다른 배송지에 이미 있으면 변경 확인 모달(node 359-15631).
 *
 * 백엔드 없음 — 저장은 `AddressManageView` 로컬 state 에만. 커밋 버전에서 폼은 RHF + Zod 로.
 * 휴대폰 번호는 zod 로 검증(제출 시 + 에러 노출 후 입력마다).
 */
export type AddressFormValues = Omit<AddressView, 'id'>;

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

const ALIAS_LABEL: Record<AddressType, string> = {
  home: '우리집',
  company: '회사',
  custom: '직접입력',
};

const phoneSchema = z.string().regex(/^01[016789]\d{7,8}$/, '올바른 휴대폰 번호를 입력해주세요');

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
  const [detailAddress, setDetailAddress] = useState(editing?.detailAddress ?? '');
  const [aliasType, setAliasType] = useState<AddressType | null>(editing?.aliasType ?? null);
  const [customAlias, setCustomAlias] = useState(
    editing?.aliasType === 'custom' ? (editing.name ?? '') : '',
  );
  const [recipient, setRecipient] = useState(editing?.recipient ?? '');
  const [phone, setPhone] = useState(editing?.phone ?? '');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  /** 변경 확인 모달 대상(우리집/회사). null 이면 닫힘. */
  const [aliasConflict, setAliasConflict] = useState<'home' | 'company' | null>(null);

  // 폼 단계에서 뒤로: 추가는 위젯으로, 수정은 목록으로.
  const backToWidget = !isEdit && picked !== null;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      if (backToWidget) setPicked(null);
      else onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [backToWidget, onClose]);

  const digitsOnly = (v: string) => v.replace(/[^0-9]/g, '');
  /** 기본배송지가 아닌 배송지를 수정할 때만 "기본 배송지로 저장" 노출. */
  const showSaveDefault = isEdit && !editing.isDefault;

  // 수정 모드: 원본과 달라진 게 있어야 CTA 활성(node 359-15595 vs 15559). 추가 모드는 항상 dirty.
  const isDirty =
    !isEdit ||
    saveAsDefault ||
    detailAddress.trim() !== (editing.detailAddress ?? '') ||
    (aliasType ?? null) !== (editing.aliasType ?? null) ||
    (aliasType === 'custom' && customAlias.trim() !== (editing.name ?? '')) ||
    recipient.trim() !== editing.recipient ||
    digitsOnly(phone) !== digitsOnly(editing.phone);

  const canSubmit = recipient.trim() !== '' && phone.trim() !== '' && isDirty;

  function validatePhone(value: string): boolean {
    const result = phoneSchema.safeParse(digitsOnly(value));
    setPhoneError(
      result.success ? null : (result.error.issues[0]?.message ?? '올바르지 않은 번호'),
    );
    return result.success;
  }

  function handlePhoneChange(value: string) {
    setPhone(value);
    if (phoneError) validatePhone(value); // 에러가 뜬 뒤엔 입력마다 재검증
  }

  function pickAlias(type: AddressType) {
    // 우리집/회사가 이미 다른 배송지에 있으면 변경 확인 모달을 먼저 띄운다.
    if (
      (type === 'home' || type === 'company') &&
      usedAliases.includes(type) &&
      aliasType !== type
    ) {
      setAliasConflict(type);
      return;
    }
    setAliasType(type);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!picked || !canSubmit) return;
    if (!validatePhone(phone)) return;

    const name =
      aliasType === 'custom'
        ? customAlias.trim() || undefined
        : aliasType
          ? ALIAS_LABEL[aliasType]
          : undefined;

    // 추가: 첫 배송지면 기본. 수정: 기존 기본은 유지, 비-기본은 체크박스 값.
    const isDefault = isEdit ? editing.isDefault || saveAsDefault : willBeDefault;

    onSubmit({
      aliasType: aliasType ?? undefined,
      name,
      roadAddress: picked.roadAddress,
      detailAddress: detailAddress.trim() || undefined,
      zonecode: picked.zonecode,
      recipient: recipient.trim(),
      phone: phone.trim(),
      deliveryType: editing?.deliveryType ?? '샛별배송',
      isDefault,
    });
  }

  const showBadge = isEdit ? editing.isDefault : willBeDefault;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? '배송지 수정' : '새 배송지 추가'}
      className="bg-surface motion-safe:animate-slide-up fixed inset-0 z-50 mx-auto flex max-w-screen-sm flex-col"
    >
      <header className="flex items-center py-1 pr-4 pl-2">
        <button
          type="button"
          onClick={backToWidget ? () => setPicked(null) : onClose}
          aria-label={!isEdit && picked === null ? '닫기' : '뒤로 가기'}
          className="inline-flex size-11 shrink-0 items-center justify-center"
        >
          <Icon name={!isEdit && picked === null ? 'close' : 'arrow-left'} size={32} aria-hidden />
        </button>
        <h1 className="text-heading-0 text-fg flex-1 px-2">
          {picked === null ? '주소 검색' : '배송지'}
        </h1>
      </header>

      {picked === null ? (
        <PostcodeSearch className="min-h-0 flex-1" onComplete={setPicked} />
      ) : (
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pt-3 pb-4">
            {/* 기본배송지 뱃지 + 도로명 주소(2줄) — Figma node 359-15317. */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                {showBadge ? (
                  <span className="bg-surface-secondary text-caption-m text-fg-secondary inline-flex h-6 w-fit items-center rounded-full px-2">
                    기본배송지
                  </span>
                ) : null}
                <p className="text-heading-4 text-fg-secondary">{picked.roadAddress}</p>
              </div>

              <Input
                label="상세주소"
                placeholder="상세주소 (동/호수 등)"
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
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
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                />
              ) : null}
            </div>

            <Input
              label="받으실 분"
              labelVisible
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />

            <Input
              label="휴대폰"
              labelVisible
              inputMode="tel"
              placeholder="숫자만 입력"
              value={phone}
              error={phoneError ?? undefined}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={(e) => {
                if (e.target.value.trim() !== '') validatePhone(e.target.value);
              }}
            />

            {showSaveDefault ? (
              // 인디케이터는 Figma "Radio_Check"(node 359-15580/15595) = 프로젝트 `Radio` check variant
              // (선택: 퍼플 링 + 퍼플 체크 / 기본: neutral-400 링 + 옅은 체크). boolean 토글이라
              // onChange(라디오는 해제 이벤트가 없음) 대신 onClick 으로 켜고 끈다.
              <div className="flex items-center gap-1">
                <Radio
                  variant="check"
                  tone="purple"
                  label="기본 배송지로 저장"
                  checked={saveAsDefault}
                  readOnly
                  onClick={() => setSaveAsDefault((v) => !v)}
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
              disabled={!canSubmit}
              className="h-14 w-full"
            >
              {isEdit ? '수정' : '저장'}
            </Button>
          </div>
        </form>
      )}

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
                  setAliasType(aliasConflict);
                  setAliasConflict(null);
                }}
              >
                확인
              </Button>
            </>
          }
        />
      ) : null}
    </div>
  );
}
