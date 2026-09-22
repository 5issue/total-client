import { ProductDetailView } from '@/components/organisms/product/ProductDetailView';

/**
 * 상품 상세 — Figma "5팀 UI 공유용" node 665-43030.
 * 이슈 #134에서 `useProductDetail` 실 데이터 연동 완료(name/brand/price/salePrice/
 * discountRate/썸네일). 원산지/후기/첫구매가/배송정보 등 계약에 없는 필드는 mock 유지.
 * 렌더링(structure §2-1): 상품 상세는 ISR 기본 대상이나, 데이터 패칭이 클라이언트 훅
 * (TanStack Query) 기반이라 이번 단계는 정적 셸 + CSR 컨테이너(ProductDetailView)로
 * 유지 — ISR 전환(RSC 서버 패칭)은 `apiClient.ts` 의 self-fetch 미지원 이슈가 풀리면 논의.
 */
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  return <ProductDetailView productId={productId} />;
}
