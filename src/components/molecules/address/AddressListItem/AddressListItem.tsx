'use client';

import { Icon, type IconName } from '@/components/atoms/Icon';
import { Radio } from '@/components/atoms/Radio';

/**
 * 배송지 목록 한 줄 (molecule). Figma "5팀 UI 공유용" — `List_Address` (node 754-58879 / 359-15669).
 *
 * [라디오] / [장소칩·기본배송지 뱃지] 주소 · 받는사람·연락처 / [배송유형] ─ [삭제] [수정]
 * 선택(라디오)은 상위 소유. 장소칩은 `우리집`(집 아이콘)·`회사`(회사 아이콘)만 노출 —
 * `직접입력`(custom)·미지정은 주소만. `onDelete` 는 있을 때만 렌더.
 *
 * 토큰(get_variable_defs node 754-58879): 장소칩 `Brand/Primary`#690085 → `text-primary`,
 * 주소 `Heading/H4_SemiBold`16 `Text/Primary`#222 → `text-heading-4 text-fg`,
 * 받는사람·연락처 `Label/M`14 `Text/Tertiary`#7e8f9b → `text-label-m text-fg-tertiary`,
 * 배송유형 `Caption/L`12/600 `Brand/Medium`#c16edd → `text-caption-l text-brand-300`,
 * 삭제·수정 `Caption/L`12/600 `Text/Tertiary` → `text-caption-l text-fg-tertiary`.
 *
 * 피드백(Figma QA #129): 받는사람·연락처는 기본배송지(`isDefault`)일 때만 노출 — 그 외
 * 배송지는 숨긴다. 굵기도 `text-label-m` 기본(500)이 진해 보인다는 지적으로 `font-normal`
 * (400)로 한 단계 낮췄다(size/line-height/letter-spacing은 그대로).
 */
const PLACE_CHIP: Record<'home' | 'company', { icon: IconName; label: string }> = {
  home: { icon: 'home-filled', label: '우리집' },
  company: { icon: 'company-filled', label: '회사' },
};

export interface AddressListItemProps {
  /** 장소 별칭 유형 — `home`·`company` 만 목록에 아이콘+라벨로 노출. `custom`·미지정은 주소만. */
  aliasType?: 'home' | 'company' | 'custom';
  roadAddress: string;
  detailAddress?: string;
  recipient: string;
  phone: string;
  /** 배송 유형 라벨(예: "샛별배송"). */
  deliveryType: string;
  isDefault?: boolean;
  /** 라디오 그룹 name — 목록이 공유. */
  radioName: string;
  selected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function AddressListItem({
  aliasType,
  roadAddress,
  detailAddress,
  recipient,
  phone,
  deliveryType,
  isDefault = false,
  radioName,
  selected,
  onSelect,
  onEdit,
  onDelete,
  className,
}: AddressListItemProps) {
  const fullAddress = detailAddress ? `${roadAddress} ${detailAddress}` : roadAddress;
  const place = aliasType === 'home' || aliasType === 'company' ? PLACE_CHIP[aliasType] : null;

  return (
    <div className={['flex w-full items-center gap-1', className].filter(Boolean).join(' ')}>
      {/* Radio 는 자체 44px 터치 타깃(label)을 갖는다 — Figma 32px 프레임 대신 §5 기준을 따른다. */}
      <Radio
        variant="ring"
        tone="purple"
        label={`${fullAddress} 배송지 선택`}
        name={radioName}
        checked={selected}
        onChange={onSelect}
        className="shrink-0"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-col gap-1">
          {(place || isDefault) && (
            <div className="flex items-center gap-1">
              {place && (
                <span className="text-primary text-heading-4 flex items-center gap-1">
                  <Icon name={place.icon} size={24} aria-hidden />
                  {place.label}
                </span>
              )}
              {isDefault && (
                <span className="bg-surface-secondary text-caption-m text-fg-secondary inline-flex h-6 items-center rounded-full px-2">
                  기본배송지
                </span>
              )}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <p className="text-heading-4 text-fg">{fullAddress}</p>
            {/* 피드백(Figma QA #129): 기본배송지가 아니면 받는사람·연락처를 노출하지 않는다.
                굵기도 text-label-m 기본(500)이 진해 보인다는 지적으로 font-normal(400)로 낮춘다. */}
            {isDefault && (
              <div className="text-label-m text-fg-tertiary flex gap-2 font-normal">
                <span>{recipient}</span>
                <span>{phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* 피드백(2026-09-21): 이 행이 시각적으로 너무 커 보인다는 지적 — 원인은 삭제·수정
            버튼의 min-h-11(44px)이 행 높이를 그대로 키우고 있어서다. 최소 44×44 터치 타깃
            (code-style §5)은 그대로 지키되, 실제 렌더 박스는 작게 만들고 `before` 가상요소로
            클릭 가능 영역만 44px로 확장한다(터치 타깃 확장 패턴 — 보이는 크기와 클릭 영역 분리). */}
        <div className="flex w-full items-center justify-between">
          <span className="text-caption-l text-brand-300">{deliveryType}</span>
          <div className="flex items-center gap-1">
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="text-caption-l text-fg-tertiary relative inline-flex min-w-11 items-center justify-center px-2 py-1 before:absolute before:inset-x-0 before:-inset-y-2.5 before:content-['']"
              >
                삭제
              </button>
            )}
            {onDelete && onEdit && <span aria-hidden className="bg-border h-3 w-px" />}
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="text-caption-l text-fg-tertiary relative inline-flex min-w-11 items-center justify-center px-2 py-1 before:absolute before:inset-x-0 before:-inset-y-2.5 before:content-['']"
              >
                수정
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
