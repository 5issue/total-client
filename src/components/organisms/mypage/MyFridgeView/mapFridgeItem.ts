import { formatDDayLabel, formatExpiryLabel } from '@/lib/formatters';
import { isAllowedImageSrc } from '@/lib/imageHosts';
import type { FridgeStockItem } from '@/types/fridge';

import { MOCK_FRIDGE_ITEMS } from './mock';
import type { FridgeFilterId, FridgeItem, FridgeStorageType } from './model';

/** "만료 임박" 필터 경계 — 명세에 기준값이 없어 기존 mock 데이터(D-2/D-3 상품)와
 *  같은 3일 이내로 잡았다(디자인 확인 필요). */
const EXPIRING_SOON_THRESHOLD_DAYS = 3;

/** mapRecipe.ts와 같은 중립 플레이스홀더 — image_url이 없거나 화이트리스트 밖
 *  호스트일 때 쓴다. */
const PLACEHOLDER_IMAGE = '/placeholders/product-thumbnail.webp';

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
 * API에 없는 표시 전용 필드(태그라인·가격)는 상품 상세(PROD-01, 역시 리뷰중) 연동
 * 전까지 기존 mock 값으로 채운다 — 같은 product_id의 mock이 있으면 그 값을, 없으면
 * 순번으로 돌려가며 기본값을 쓴다(#134 "계약에 없는 필드는 mock 유지" 원칙과 동일).
 * 이미지는 FRIDGE-01 v0.2 초안부터 `product.image_url`로 실 데이터가 온다(#171) —
 * 더는 mock을 쓰지 않는다. 수량·유통기한·보관 여부·만료 상태도 전부 실 데이터다.
 * 보관팁은 이 모델에 더 없다 — `FridgeStorageTipBottomSheet`가 PROD-03(#142)을
 * 온디맨드로 직접 조회한다.
 *
 * `detailProductIdByAiId`는 `MyFridgeViewContainer`가 `GET /products/by-ai`로 전체
 * 품목을 한 번에 조회해 만든 AI product_id → BE 상품 id 맵이다(이슈 #203). 같은
 * product_id에 GROUP·UNIT 두 항목이 있으면 GROUP 쪽을 쓴다 — 상세 페이지는 UNIT
 * 선택지를 보여주는 GROUP 화면이라서다(`FridgeRefillBottomSheet`가 UNIT을 쓰는 것과
 * 반대, by-ai 응답은 GROUP이 먼저 와서 맵에 먼저 들어간다).
 */
export function toFridgeItemViewModel(
  apiItem: FridgeStockItem,
  index: number,
  detailProductIdByAiId: ReadonlyMap<string, string> = new Map(),
): FridgeItem {
  // MOCK_FRIDGE_ITEMS는 고정 길이 배열이라 나머지 연산 인덱스는 항상 유효하다 —
  // noUncheckedIndexedAccess 회피용 non-null assertion.
  const matchingMock = MOCK_FRIDGE_ITEMS.find(
    (mock) => mock.productId === apiItem.product.product_id,
  );
  const extras = matchingMock ?? MOCK_FRIDGE_ITEMS[index % MOCK_FRIDGE_ITEMS.length]!;

  const dDayLabel = apiItem.expires_at ? formatDDayLabel(apiItem.expires_at) : extras.dDayLabel;
  // 실제 재고는 expires_at이 없을 수 있다(API 스키마 허용) — 이 경우 일치하지 않는
  // mock의 유통기한을 대신 보여주면 안 된다(코드래빗 리뷰).
  const expiryLabel = apiItem.expires_at ? formatExpiryLabel(apiItem.expires_at) : '유통기한 없음';

  return {
    id: apiItem.product.product_id,
    productId: apiItem.product.product_id,
    detailProductId: detailProductIdByAiId.get(apiItem.product.product_id) ?? null,
    name: apiItem.product.name,
    tagline: extras.tagline,
    imageSrc: isAllowedImageSrc(apiItem.product.image_url)
      ? apiItem.product.image_url
      : PLACEHOLDER_IMAGE,
    quantityLabel: `${apiItem.quantity}${apiItem.unit}`,
    expiryLabel,
    dDayLabel,
    storageType: mapStorageType(apiItem.product.storage_type ?? ''),
    expired: apiItem.is_expired,
    // 품절 여부는 상품 상세 API 전까지 mock에서만 가져온다 — 일치하는 mock이 없는
    // 실제 품목까지 인덱스 fallback mock의 soldOut을 물려받으면 안 된다(코드래빗 리뷰).
    soldOut: matchingMock?.soldOut,
    filters: deriveFilters(apiItem.is_expired, apiItem.expires_at ? dDayLabel : null),
    priceLabel: extras.priceLabel,
    originalPriceLabel: extras.originalPriceLabel,
    memberPriceLabel: extras.memberPriceLabel,
  };
}
