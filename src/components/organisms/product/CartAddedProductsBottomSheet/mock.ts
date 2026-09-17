import type { ProductCardProps } from '@/components/molecules/product/ProductCard';

/** 퍼블리싱용 더미 데이터 — Figma 예시(node 665:43409) 그대로. */
export type RecommendedProduct = Omit<ProductCardProps, 'onAddToCart' | 'className' | 'size'> & {
  id: string;
};

export const MOCK_RECOMMENDED_PRODUCTS: RecommendedProduct[] = [
  {
    id: 'rec-1',
    imageAlt: '',
    deliveryLabel: '샛별배송',
    name: '친환경 베이비 바질 10g',
    priceLabel: '995원',
    couponPercentLabel: '+25%',
  },
  {
    id: 'rec-2',
    imageAlt: '',
    deliveryLabel: '샛별배송',
    name: '[더브레드블루] 통밀발효종빵 300g',
    priceLabel: '135,000원',
    couponPercentLabel: '+25%',
  },
  {
    id: 'rec-3',
    imageAlt: '',
    deliveryLabel: '샛별배송',
    name: '[주말특가][KF365] 대추방울토마토 750g',
    originalPriceLabel: '13,990',
    discountLabel: '35%',
    priceLabel: '8,990원',
    couponPercentLabel: '+25%',
  },
  {
    id: 'rec-4',
    imageAlt: '',
    deliveryLabel: '샛별배송',
    name: '[올리타리아] 엑스트라버진 올리브 오일 500mL',
    originalPriceLabel: '20,900',
    discountLabel: '30%',
    priceLabel: '14,590원',
    couponPercentLabel: '+25%',
  },
];
