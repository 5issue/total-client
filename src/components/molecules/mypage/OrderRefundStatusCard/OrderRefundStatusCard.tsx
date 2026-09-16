import { CancelReturnProductRow } from '@/components/molecules/mypage/CancelReturnProductRow';
import type { CancelReturnProductRowProps } from '@/components/molecules/mypage/CancelReturnProductRow';
import { StepProgressIndicator } from '@/components/molecules/mypage/StepProgressIndicator';
import { AccordionBreakdown } from '@/components/molecules/shared/AccordionBreakdown';

/**
 * 취소·반품·교환 내역 카드 한 건 (molecule). Figma "5팀 UI 공유용" —
 * `OrderRefundStatusCard`(node 1233-115014, 취소 2단계는 666-30373).
 *
 * 진행 단계 인디케이터는 선택이다 — `steps` 를 안 주면(완료 후 5일 경과, node
 * 666-30389) 인디케이터와 그 아래 구분선을 통째로 뺀다(Figma `showIndicator`/
 * `showLine` 이 항상 같이 꺼진다). 상품이 4개 이상이면 `AccordionBreakdown` 이
 * 3개만 보이다 펼치기 토글을 붙인다(공용 molecule 재사용, node 1233-115006 문구와
 * 이미 일치).
 */
export interface OrderRefundStatusCardProps {
  /** 진행 단계 라벨. 생략하면 인디케이터를 렌더하지 않는다(완료 후 5일 경과). */
  steps?: string[];
  activeStepIndex?: number;
  status: string;
  /** 접수일자 표시 문구(예: "접수일자 2026. 08. 26"). */
  receivedDateLabel: string;
  products: CancelReturnProductRowProps[];
  className?: string;
}

export function OrderRefundStatusCard({
  steps,
  activeStepIndex = 0,
  status,
  receivedDateLabel,
  products,
  className,
}: OrderRefundStatusCardProps) {
  return (
    <div
      className={['bg-surface flex w-full flex-col gap-4 rounded-xl px-4 pt-4 pb-5', className]
        .filter(Boolean)
        .join(' ')}
    >
      {steps ? (
        <>
          <StepProgressIndicator steps={steps} activeIndex={activeStepIndex} />
          <hr className="border-border -mx-px" />
        </>
      ) : null}

      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-heading-2 text-primary">{status}</p>
          <p className="text-body-s text-fg-tertiary">{receivedDateLabel}</p>
        </div>

        <AccordionBreakdown>
          {products.map((product) => (
            <CancelReturnProductRow key={product.name} {...product} />
          ))}
        </AccordionBreakdown>
      </div>
    </div>
  );
}
