import { HttpResponse, http } from 'msw';

import type { Product } from '@/types/product';

/**
 * Spring 백엔드가 아직 배포 전이라 상품 검색 응답을 목킹한다(auth.ts 와 동일 패턴).
 * `API_INTERNAL_URL` 기준으로 매칭 — 우리 Route Handler(`/api/products`)가 서버사이드로
 * 호출하는 요청을 가로챈다(api-convention §3). 쿼리별 매칭 로직 없이 고정 목록 하나를
 * 반환한다 — Figma 목업(node 882-60568, 검색어 "우유")도 동일하게 고정 예시라 맞춘다.
 */
const BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

/**
 * 목데이터 썸네일. 상품 이미지 API 가 없는 구간이라 중립 플레이스홀더 한 장을 쓴다 —
 * "이미지 미연동" 상태가 한눈에 보이고 외부 호스트 의존도 없다. 실제 CDN 이 붙으면 이
 * 상수만 응답값으로 교체한다.
 */
const PLACEHOLDER_THUMBNAIL = '/placeholders/product-thumbnail.webp';

function nowIso() {
  return new Date().toISOString();
}

/** Figma node 882-60569 상품 그리드 8개를 그대로 목데이터화. */
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: '[연세우유 x 마켓컬리] 전용목장우유 900mL',
    thumbnailUrl: PLACEHOLDER_THUMBNAIL,
    price: 2780,
    originalPrice: 3400,
    discountRate: 25,
    reviewCount: 9999,
    couponBadgeLabel: '+25%쿠폰',
    deliveryType: '샛별배송',
    kurlyOnly: true,
    membershipBenefit: false,
  },
  {
    id: 'p2',
    name: '[연세우유 x 마켓컬리] 전용목장우유 1.8L',
    thumbnailUrl: PLACEHOLDER_THUMBNAIL,
    price: 4752,
    originalPrice: 5280,
    discountRate: 10,
    reviewCount: 9999,
    couponBadgeLabel: '+25%쿠폰',
    deliveryType: '샛별배송',
    kurlyOnly: true,
    membershipBenefit: false,
  },
  {
    id: 'p3',
    name: '[서울우유] 나 100% 우유 1000mL',
    thumbnailUrl: PLACEHOLDER_THUMBNAIL,
    price: 2682,
    originalPrice: 2980,
    discountRate: 10,
    reviewCount: 9999,
    couponBadgeLabel: '+25%쿠폰',
    deliveryType: '샛별배송',
    kurlyOnly: false,
    membershipBenefit: false,
  },
  {
    id: 'p4',
    name: '[제주우유] 제주 목초 우유 무항생제 750mL',
    thumbnailUrl: PLACEHOLDER_THUMBNAIL,
    price: 2952,
    originalPrice: 3280,
    discountRate: 10,
    reviewCount: 9999,
    couponBadgeLabel: '+25%쿠폰',
    deliveryType: '샛별배송',
    kurlyOnly: true,
    membershipBenefit: false,
  },
  {
    id: 'p5',
    name: '[제주우유] 저지우유 750mL',
    thumbnailUrl: PLACEHOLDER_THUMBNAIL,
    price: 4491,
    originalPrice: 4990,
    discountRate: 10,
    reviewCount: 9999,
    couponBadgeLabel: '+25%쿠폰',
    deliveryType: '샛별배송',
    kurlyOnly: true,
    membershipBenefit: false,
  },
  {
    id: 'p6',
    name: '[연세우유 x 마켓컬리] 저지방 전용목장 우유 900mL',
    thumbnailUrl: PLACEHOLDER_THUMBNAIL,
    price: 2382,
    originalPrice: 2980,
    discountRate: 10,
    reviewCount: 9999,
    couponBadgeLabel: '+25%쿠폰',
    deliveryType: '샛별배송',
    kurlyOnly: true,
    membershipBenefit: false,
  },
  {
    id: 'p7',
    name: '[서울우유] 나100% 우유 2.3L 2종 (택1)',
    thumbnailUrl: PLACEHOLDER_THUMBNAIL,
    price: 6822,
    originalPrice: 7580,
    discountRate: 10,
    reviewCount: 9999,
    couponBadgeLabel: '+25%쿠폰',
    deliveryType: '샛별배송',
    kurlyOnly: false,
    membershipBenefit: false,
  },
  {
    id: 'p8',
    name: '[제주축산농협] 제주목장 무항생제 목초 우유 900mL',
    thumbnailUrl: PLACEHOLDER_THUMBNAIL,
    price: 3280,
    originalPrice: 3900,
    discountRate: 15,
    reviewCount: 9999,
    couponBadgeLabel: '+25%쿠폰',
    deliveryType: '샛별배송',
    kurlyOnly: false,
    membershipBenefit: false,
  },
];

export const productHandlers = [
  // GET /api/v1/products — 검색 결과 상품 목록
  http.get(`${BASE}/api/v1/products`, () => {
    return HttpResponse.json({
      status: 'SUCCESS',
      message: '상품 목록',
      data: {
        items: MOCK_PRODUCTS,
        pagination: { totalCount: 32, nextCursor: null },
      },
      error: null,
      timestamp: nowIso(),
    });
  }),
];
