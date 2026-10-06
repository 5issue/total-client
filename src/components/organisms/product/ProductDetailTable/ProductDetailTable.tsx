/**
 * 상품정보제공고시 표 (organism). Figma "5팀 디자인 시스템" `ProductDetailTable`
 * (node 1233:119480, type=Expanded) — 라벨 11행, 값 칸은 이 mock 단계에서 전부
 * "상품 설명 및 상품이미지 참조"(실제 표시·광고 페이지 참조를 뜻하는 정형 문구).
 * 데이터 연동 시 행별 실제 값으로 교체된다.
 *
 * 값 칸은 `flex-1 min-w-0`(라벨만 `w-31.5` 고정) — 둘 다 고정폭(126+242=368px)이면
 * 375px 화면(px-4 제외 343px)에서 `overflow-hidden`에 잘린다.
 */
const PLACEHOLDER_VALUE = '상품 설명 및 상품이미지 참조';

const ROW_LABELS = [
  '제품명',
  '식품의 유형',
  '생산자 및 소재지 (또는 생산자, 수입자 및 제조국)',
  '제조연월일, 소비기한 또는 품질유지기한',
  '포장단위별 내용물의 용량(중량), 수량, 크기',
  '원재료명 및 함량',
  '영양성분표시',
  '유전자변형식품 표시',
  '소비자 안전을 위한 주의사항',
  '수입식품 여부',
  '소비자 상담 관련 전화번호',
];

export type ProductDetailTableProps = {
  className?: string;
};

export function ProductDetailTable({ className }: ProductDetailTableProps) {
  return (
    <div
      className={['border-border rounded-m w-full overflow-hidden border', className]
        .filter(Boolean)
        .join(' ')}
    >
      {ROW_LABELS.map((label, i) => (
        <div key={label} className={`flex w-full ${i > 0 ? 'border-border border-t' : ''}`}>
          <div className="bg-border flex w-31.5 shrink-0 items-center p-3">
            <p className="text-body-m text-fg">{label}</p>
          </div>
          <div className="border-border flex min-w-0 flex-1 items-center border-l p-3">
            <p className="text-label-m text-fg-tertiary">{PLACEHOLDER_VALUE}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
