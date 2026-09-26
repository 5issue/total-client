import { formatDDayLabel, formatExpiryLabel } from '@/lib/formatters';
import type { FridgeStockItem } from '@/types/fridge';

import { MOCK_FRIDGE_ITEMS } from './mock';
import type { FridgeFilterId, FridgeItem, FridgeStorageType } from './model';

/** "만료 임박" 필터 경계 — 명세에 기준값이 없어 기존 mock 데이터(D-2/D-3 상품)와
 *  같은 3일 이내로 잡았다(디자인 확인 필요). */
const EXPIRING_SOON_THRESHOLD_DAYS = 3;

/** 실제 enum 값 미확정(명세 §05-3에 값 목록 없음) — 문자열에 냉동 계열 단어가 있으면
 *  frozen, 그 외 refrigerated로 취급한다. AI 서버 스키마 확정 시 교체. */
function mapStorageType(raw: string): FridgeStorageType {
  return /frozen|냉동/i.test(raw) ? 'frozen' : 'refrigerated';
}

function deriveFilters(isExpired: boolean, dDayLabel: string | null): FridgeFilterId[] {
  if (isExpired) return ['expired'];
  const isExpiringSoon =
    dDayLabel !== null &&
    dDayLabel.startsWith('D-') &&
    dDayLabel !== 'D-day' &&
    Number(dDayLabel.slice(2)) <= EXPIRING_SOON_THRESHOLD_DAYS;
  return isExpiringSoon ? ['stored', 'expiring'] : ['stored'];
}

/**
 * FRIDGE-01 응답(`FridgeStockItem`) → 화면 표시 모델(`FridgeItem`) 변환 (이슈 #138).
 *
 * API에 없는 표시 전용 필드(태그라인·가격·보관팁·이미지)는 상품 상세(PROD-01, 역시
 * 리뷰중) 연동 전까지 기존 mock 값으로 채운다 — 같은 product_id의 mock이 있으면 그
 * 값을, 없으면 순번으로 돌려가며 기본값을 쓴다(#134 "계약에 없는 필드는 mock 유지"
 * 원칙과 동일). 수량·유통기한·보관 여부·만료 상태는 전부 실 데이터다.
 */
export function toFridgeItemViewModel(apiItem: FridgeStockItem, index: number): FridgeItem {
  // MOCK_FRIDGE_ITEMS는 고정 길이 배열이라 나머지 연산 인덱스는 항상 유효하다 —
  // noUncheckedIndexedAccess 회피용 non-null assertion.
  const extras =
    MOCK_FRIDGE_ITEMS.find((mock) => mock.productId === apiItem.product.product_id) ??
    MOCK_FRIDGE_ITEMS[index % MOCK_FRIDGE_ITEMS.length]!;

  const dDayLabel = apiItem.expires_at ? formatDDayLabel(apiItem.expires_at) : extras.dDayLabel;
  const expiryLabel = apiItem.expires_at
    ? formatExpiryLabel(apiItem.expires_at)
    : extras.expiryLabel;

  return {
    id: apiItem.product.product_id,
    productId: apiItem.product.product_id,
    name: apiItem.product.name,
    tagline: extras.tagline,
    imageSrc: extras.imageSrc,
    quantityLabel: `${apiItem.quantity}${apiItem.unit}`,
    expiryLabel,
    dDayLabel,
    storageType: mapStorageType(apiItem.product.storage_type ?? ''),
    expired: apiItem.is_expired,
    soldOut: extras.soldOut,
    filters: deriveFilters(apiItem.is_expired, apiItem.expires_at ? dDayLabel : null),
    priceLabel: extras.priceLabel,
    originalPriceLabel: extras.originalPriceLabel,
    memberPriceLabel: extras.memberPriceLabel,
    storageTip: extras.storageTip,
  };
}
