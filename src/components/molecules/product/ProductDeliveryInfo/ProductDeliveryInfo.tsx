/**
 * 라벨-값 행 하나 (molecule). Figma "5팀 UI 공유용" `ProductDeliveryInfo`(node 1233:113396) —
 * 상품 상세 개요 카드의 배송/배송비/판매자/단위당가격 행, 배송 안내 섹션에서도 재사용.
 *
 * 라벨 칼럼은 85px 고정폭(Figma 실측) — 값 칼럼 시작 위치를 행마다 맞추기 위함.
 */
export type ProductDeliveryInfoProps = {
  label: string;
  value: string;
  /** 있으면 값 아래 보조 설명을 추가로 렌더한다(예: 배송 안내 문구). */
  note?: string;
  className?: string;
};

export function ProductDeliveryInfo({ label, value, note, className }: ProductDeliveryInfoProps) {
  return (
    <div className={['flex w-full items-start gap-px', className].filter(Boolean).join(' ')}>
      <p className="text-label-m text-fg-secondary w-21.25 shrink-0">{label}</p>
      <div className="flex flex-col items-start gap-1">
        <p className="text-label-m text-fg">{value}</p>
        {note ? <p className="text-caption-m text-fg-quaternary">{note}</p> : null}
      </div>
    </div>
  );
}
