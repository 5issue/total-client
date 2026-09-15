'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Radio } from '@/components/atoms/Radio';
import { BottomSheet } from '@/components/molecules/shared/BottomSheet';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';

import { MOCK_REFUND_REASON_ITEM, REFUND_REASON_OPTIONS } from './mock';

/**
 * 반품 사유 화면 (organism). Figma "5팀 UI 공유용" —
 * 미선택 666-29306 / 시트 열림(라디오 미선택) 666-29905 / 선택 완료 666-30033.
 *
 * 트리거는 네이티브 셀렉트가 아니라 `BottomSheet`. 시트는 기본 아무 라디오도 선택하지 않는다.
 * `다음` 은 사유가 있을 때만 활성.
 */
export interface RefundReasonViewProps {
  /** 스토리·초기 상태용. 생략·null 이면 미선택. */
  defaultReasonId?: string | null;
  /** 스토리용. 생략 시 시트 닫힘. */
  defaultSheetOpen?: boolean;
}

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;

export function RefundReasonView({
  defaultReasonId = null,
  defaultSheetOpen = false,
}: RefundReasonViewProps) {
  const router = useRouter();
  const item = MOCK_REFUND_REASON_ITEM;
  const [reasonId, setReasonId] = useState<string | null>(defaultReasonId);
  const [sheetOpen, setSheetOpen] = useState(defaultSheetOpen);

  const selected = REFUND_REASON_OPTIONS.find((o) => o.id === reasonId && !o.disabled);
  const canNext = Boolean(selected);

  return (
    <>
      <SectionHeader leading="back" onLeadingClick={() => router.back()} title="반품사유" />

      <div className="bg-surface-secondary flex min-h-0 flex-1 flex-col">
        <div className="bg-surface mx-4 mt-7 flex min-h-0 flex-1 flex-col gap-4">
          <div className="flex items-start gap-3">
            <div aria-hidden className="bg-surface-secondary size-14 shrink-0 rounded-sm" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-heading-5 text-fg">{item.name}</p>
              <div className="text-heading-5 text-fg-tertiary flex items-center gap-1">
                <span>{item.quantity}개</span>
                <span aria-hidden className="bg-border h-3 w-px shrink-0" />
                <span>{won(item.price)}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={sheetOpen}
            onClick={() => setSheetOpen(true)}
            className="border-border flex h-12.5 w-full items-center justify-between rounded-sm border py-1 pr-3 pl-4"
          >
            <span
              className={selected ? 'text-heading-5 text-fg' : 'text-heading-5 text-fg-quaternary'}
            >
              {selected ? selected.label : '반품 사유를 선택해주세요'}
            </span>
            <span className="flex size-10 items-center justify-center">
              <Icon name="arrow-down" size={28} aria-hidden />
            </span>
          </button>
        </div>

        <div className="bg-surface px-4 pt-2 pb-2">
          <Button variant="black" size="l" disabled={!canNext} className="h-14 w-full">
            다음
          </Button>
        </div>
      </div>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        ariaLabel="반품 사유를 선택해주세요"
      >
        <div className="flex flex-col">
          <h2 className="text-heading-2 text-fg flex h-10 items-center px-4">
            반품 사유를 선택해주세요
          </h2>
          <fieldset className="flex flex-col gap-3 pb-4">
            <legend className="sr-only">반품 사유</legend>
            {REFUND_REASON_OPTIONS.map((option) => {
              const inputId = `refund-reason-${option.id}`;
              return (
                <div key={option.id} className="flex min-h-10 items-center px-4">
                  <Radio
                    id={inputId}
                    tone="black"
                    name="refund-reason"
                    value={option.id}
                    label={option.label}
                    disabled={option.disabled}
                    checked={reasonId === option.id}
                    onChange={() => {
                      if (option.disabled) return;
                      setReasonId(option.id);
                    }}
                  />
                  <label
                    htmlFor={inputId}
                    aria-hidden
                    className={
                      option.disabled
                        ? 'text-heading-2 text-fg-disabled cursor-not-allowed'
                        : 'text-heading-2 text-fg cursor-pointer'
                    }
                  >
                    {option.label}
                  </label>
                </div>
              );
            })}
          </fieldset>
        </div>
      </BottomSheet>
    </>
  );
}
