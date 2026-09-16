import { ProductDetailView } from '@/components/organisms/product/ProductDetailView';

/**
 * 상품 상세 — Figma "5팀 UI 공유용" node 665-43030.
 * 퍼블리싱 단계: 상단 네비게이션+탭, 대표 이미지+개요 카드, 하단 CTA+담기 바텀시트까지
 * (이슈 #101 1~4). 브랜드/후기/추천상품/배송안내/상세설명/구매안내 섹션은 후속 작업.
 * 데이터 훅(`useProductDetail`) 연동은 다음 단계 — 현재는 목 데이터.
 * 렌더링(structure §2-1): 상품 상세는 ISR 기본 대상이나, 이번 단계는 UI-only 라 page 는
 * 정적 셸 + CSR 컨테이너(ProductDetailView)로 시작하고, ISR 전환은 데이터 연동 시 논의.
 */
export default function ProductDetailPage() {
  return <ProductDetailView />;
}
