import type { ProductDeliveryInfoProps } from '@/components/molecules/product/ProductDeliveryInfo';

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
};
