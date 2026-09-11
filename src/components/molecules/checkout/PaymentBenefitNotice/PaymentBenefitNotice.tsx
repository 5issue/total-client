/**
 * 결제수단별 진행 중 혜택 안내 (molecule). Figma "5팀 UI 공유용" — `List_Order_Benefit` (node 666-20378).
 *
 * 제목(수단명) + 여러 줄 안내 불릿. 결제수단 아코디언 하단 "무이자 혜택" 영역에서 쓴다 —
 * 어떤 결제수단이 노출되든 이 셸은 그대로, `title`/`bullets`만 바뀐다.
 */
export interface PaymentBenefitNoticeProps {
  /** 수단명(예: "토스페이"). */
  title: string;
  /** 안내 문구 각 줄 — 불릿으로 렌더. */
  bullets: string[];
  className?: string;
}

export function PaymentBenefitNotice({ title, bullets, className }: PaymentBenefitNoticeProps) {
  return (
    <div className={['flex flex-col', className].filter(Boolean).join(' ')}>
      <p className="text-label-m text-fg-secondary">{title}</p>
      <ul className="text-caption-m text-fg-tertiary list-disc">
        토스페이 1만원 이상 결제 시, 1만원 토스포인트 추첨 적립
      </ul>
      <ul className="text-caption-m text-fg-tertiary list-disc pl-4.5">
        {bullets.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
