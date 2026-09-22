import type { ProductDeliveryInfoProps } from '@/components/molecules/product/ProductDeliveryInfo';
import type { ProductDetail, ProductSpec } from '@/types/product';

/** `ProductSpec.storageType`/`packagingType` 한글 라벨 — 백엔드 enum 자체의 라벨(`ProductSpec` 엔티티)과 동일. */
export const STORAGE_TYPE_LABEL: Record<ProductSpec['storageType'], string> = {
  REFRIGERATED: '냉장',
  FROZEN: '냉동',
  ROOM_TEMPERATURE: '실온',
};
export const PACKAGING_TYPE_LABEL: Record<ProductSpec['packagingType'], string> = {
  PAPER: '종이',
  PLASTIC: '플라스틱',
  FOAM: '스티로폼',
  CARDBOARD: '골판지',
};

/** 상품 상세 화면 도메인 타입 — 퍼블리싱 단계 공용. API 연동 시 Zod 스키마(`types/product.ts`)로 대체. */
export type ProductDetailOverview = {
  imageSrc?: string;
  brandLabel: string;
  shippingInfo: string;
  name: string;
  subCopy?: string;
  origin: string;
  reviewCountLabel: string;
  discountRate?: string;
  originalPriceLabel?: string;
  priceLabel: string;
  specialPriceLabel?: string;
  specialPriceNote?: string;
  deliveryRows: ProductDeliveryInfoProps[];
  memberDeal?: boolean;
  /** 최근 3개월 재구매 인원 — 있으면 실시간 구매정보 토스트를 노출한다. */
  recentRepurchaseCount?: number;
  /** 있으면 담기 성공 시 미션 완료 토스트(node 665-43410)를 함께 노출한다. */
  missionReward?: { pointsLabel: string; description: string };
};

/**
 * `ProductDetailOverview` 중 product-service 상세 응답(`ProductDetail`)에 없는 필드만 모은
 * 타입 — 원산지·후기건수·첫구매가·배송정보·멤버딜·재구매/미션 토스트는 이 계약에 아예
 * 없어(다른 서비스 영역으로 추정, 이슈 #134 범위 밖) 당분간 고정 mock 값을 그대로 쓴다.
 */
export type StaticOverviewFields = Omit<
  ProductDetailOverview,
  'imageSrc' | 'brandLabel' | 'name' | 'priceLabel' | 'originalPriceLabel' | 'discountRate'
>;

/** 실 API 응답(`ProductDetail`)과 아직 계약에 없는 정적 필드를 합쳐 `ProductDetailOverview`를 만든다. */
export function toProductDetailOverview(
  detail: ProductDetail,
  staticFields: StaticOverviewFields,
): ProductDetailOverview {
  const hasDiscount = detail.discountRate > 0;

  return {
    imageSrc: detail.media.find((m) => m.mediaRole === 'THUMBNAIL')?.mediaUrl,
    brandLabel: detail.brand,
    name: detail.name,
    priceLabel: detail.salePrice.toLocaleString('ko-KR'),
    originalPriceLabel: hasDiscount ? detail.price.toLocaleString('ko-KR') : undefined,
    discountRate: hasDiscount ? `${detail.discountRate}%` : undefined,
    ...staticFields,
  };
}
