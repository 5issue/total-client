import { CustomerSupportSection } from '@/components/organisms/product/CustomerSupportSection';
import { ProductDescriptionContent } from '@/components/organisms/product/ProductDescriptionContent';

/**
 * "상세정보" 탭 전체 콘텐츠 (organism). Figma "5팀 UI 공유용" node 665-43688 —
 * 공유 브랜드 스토리 블록(`ProductDescriptionContent`) + 고객센터/정책 안내
 * (`CustomerSupportSection`).
 */
export function ProductSpecTab() {
  return (
    <div className="flex w-full flex-col">
      <ProductDescriptionContent />
      <CustomerSupportSection />
    </div>
  );
}
