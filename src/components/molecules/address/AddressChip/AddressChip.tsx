'use client';

import { Icon, type IconName } from '@/components/atoms/Icon/Icon';

/**
 * 배송지 선택 칩 (Figma "Address_Chip", node 2424-1213/1214(Home),
 * 2627-1690/1692(Company), 2627-1689/1691(Custom)). Type × State(Default/Selected) 3×2.
 *
 * 배송지 유형(도메인 지식)을 담고 있어 atoms 가 아닌 molecules/address 에 둔다.
 * "우리집"/"회사"/"직접입력"은 Figma 목업 예시 카피일 뿐 — 실제로는 사용자가 지정한
 * 배송지 이름이 오므로 `label` 은 항상 호출 쪽이 넘기는 자유 텍스트로 둔다. `type` 은
 * outline(Default)/filled(Selected) 아이콘 스왑에만 쓰인다.
 *
 * outline 아이콘(home/company/location)은 themable(currentColor)이라 텍스트 색을 따라가고,
 * filled 아이콘은 Figma 원본이 브랜드 퍼플로 고정된 에셋이라 selected 텍스트/보더 색과 별도
 * 매칭 없이도 일치한다.
 */
export type AddressType = 'home' | 'company' | 'custom';

export interface AddressChipProps {
  type: AddressType;
  label: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const ICON_BY_TYPE: Record<AddressType, { default: IconName; selected: IconName }> = {
  home: { default: 'home', selected: 'home-filled' },
  company: { default: 'company', selected: 'company-filled' },
  custom: { default: 'location', selected: 'location-filled' },
};

const BASE_CLASSNAME =
  'bg-surface inline-flex items-center gap-1 rounded-full border px-6 py-3 text-heading-5 whitespace-nowrap transition-colors disabled:pointer-events-none motion-reduce:transition-none';

export function AddressChip({
  type,
  label,
  selected = false,
  onClick,
  disabled,
  className,
}: AddressChipProps) {
  const icon = ICON_BY_TYPE[type][selected ? 'selected' : 'default'];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={[
        BASE_CLASSNAME,
        selected ? 'border-primary text-primary' : 'border-border text-fg',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Icon name={icon} size={24} aria-hidden />
      {label}
    </button>
  );
}
