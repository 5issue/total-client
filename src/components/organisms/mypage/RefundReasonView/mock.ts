import type { RefundReasonItemInput } from './model';

export interface RefundReasonOption {
  id: string;
  label: string;
  disabled?: boolean;
}

export const REFUND_REASON_OPTIONS: RefundReasonOption[] = [
  { id: 'change-of-mind', label: '단순변심 (냉장 및 냉동상품 불가)', disabled: true },
  { id: 'defect', label: '상품불량' },
  { id: 'damage', label: '상품파손' },
  { id: 'cold-damage', label: '냉해' },
  { id: 'thaw', label: '해동' },
  { id: 'wrong-delivery', label: '오배송' },
  { id: 'missing', label: '상품누락' },
  { id: 'sold-out', label: '상품품절' },
  { id: 'info-mismatch', label: '상품정보 상이' },
];

/** `items` prop 없이(직접 진입·스토리북) 들어왔을 때만 쓰는 폴백 1건. Figma node 666-*. */
export const MOCK_REFUND_REASON_ITEMS: RefundReasonItemInput[] = [
  {
    id: 'mock-item',
    name: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
    price: 2720,
    quantity: 1,
  },
];
