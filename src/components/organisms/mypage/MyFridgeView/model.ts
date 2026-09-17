/**
 * 나의 냉장고 화면(node 1120-56174 등) 표시 모델.
 * 퍼블리싱 단계라 서버 계약(Zod 스키마)이 아니라 화면용 타입만 둔다. 데이터 연결 시
 * `hooks/fridge` 등에서 내려오는 스키마로 교체.
 */
export type FridgeTabId = 'fridge' | 'recipe';

export type FridgeFilterId = 'all' | 'stored' | 'expiring' | 'expired';

export interface FridgeFilterOption {
  id: FridgeFilterId;
  label: string;
}

export const FRIDGE_FILTERS: FridgeFilterOption[] = [
  { id: 'all', label: '전체' },
  { id: 'stored', label: '보관중' },
  { id: 'expiring', label: '만료 임박' },
  { id: 'expired', label: '만료' },
];

/** 배지 아이콘 색 계열(node 2374-2100/2103 `Custom/cold`·`Custom/freeze` 참고) — 실제
 *  보관 방법과 무관하게 Figma 목업 아이콘을 그대로 옮긴 분류다(만료 임박 필터 분리 기준과
 *  같은 원칙, mock.ts 참고). */
export type FridgeStorageType = 'refrigerated' | 'frozen';

export interface FridgeItem {
  id: string;
  /** 이미지 클릭 시 이동할 상품 상세 페이지(`/products/[productId]`). */
  productId: string;
  name: string;
  /** 보관팁/담기 시트 상단 한 줄 소개. */
  tagline: string;
  imageSrc?: string;
  quantityLabel: string;
  expiryLabel: string;
  /** 예: "D-2"(임박) · "D+4"(경과). */
  dDayLabel: string;
  storageType: FridgeStorageType;
  expired: boolean;
  /** 품절이어도 상세 페이지 이동은 그대로 가능 — "채워넣기" 버튼만 비활성화한다. */
  soldOut?: boolean;
  /**
   * `'all'` 제외 소속 필터. `expiring`은 `stored`의 부분집합이지만 Figma 목업이 두
   * D-3 상품 중 하나만 "만료 임박"에 포함시켜 임계값 계산 대신 목업 그대로 옮겼다
   * (PromoSummarySection mock.ts 의 "디자인 목업 값을 그대로 옮긴 것" 원칙과 동일).
   */
  filters: FridgeFilterId[];
  /** 일반가. */
  priceLabel: string;
  /** 정가(할인 전 가격) — 있는 상품만. 없으면 `priceLabel` 자체가 정가다. */
  originalPriceLabel?: string;
  /** 멤버스가 — "채워넣기" 시트가 일반가/멤버스가 두 줄을 함께 보여준다(node 1206-109860). */
  memberPriceLabel: string;
  storageTip: {
    title: string;
    steps: string[];
  };
}

export function matchesFridgeFilter(item: FridgeItem, filterId: FridgeFilterId): boolean {
  return filterId === 'all' || item.filters.includes(filterId);
}
