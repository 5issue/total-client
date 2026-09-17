'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/Button';
import { RefundLineItem } from '@/components/molecules/mypage/RefundLineItem';
import { RefundSelectAllBar } from '@/components/molecules/mypage/RefundSelectAllBar';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';

import { MOCK_REFUND_ITEMS } from './mock';

/**
 * 반품 접수 화면 컨테이너 (organism). Figma node 848-82641.
 *
 * 목록 카드: 회색 셸 위 흰 면 `rounded-xl`(테두리 없음, 라운드만), 폭 372(`mx-3.75`),
 * 내부 `px-4 pt-2 pb-5`. 카드는 내용 높이만 차지한다(`flex-1` 금지).
 */
export interface RefundReturnViewProps {
  /** 스토리·초기 상태용. 생략 시 미선택(node 848-82641). */
  defaultSelectedIds?: string[];
}

export function RefundReturnView({ defaultSelectedIds }: RefundReturnViewProps) {
  const router = useRouter();
  const items = MOCK_REFUND_ITEMS;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(defaultSelectedIds ?? []),
  );

  const selectedCount = selectedIds.size;
  const totalCount = items.length;
  const canNext = selectedCount > 0;

  /** 선택한 상품 id를 쿼리로 넘겨 반품 사유 화면으로 이동한다. */
  function goToReasonStep() {
    // 체크한 상품 id 를 다음 화면(반품 사유)에 전달한다 — 항목이 여럿이면
    // 그만큼 사유 입력 그룹이 반복돼야 하기 때문(RefundReasonView 참고).
    const ids = items.filter((item) => selectedIds.has(item.id)).map((item) => item.id);
    const query = new URLSearchParams({ items: ids.join(',') }).toString();
    router.push(`/mypage/orders/return/reason?${query}`);
  }

  /** 개별 상품 선택 상태를 갱신한다. */
  function setItemChecked(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  /** 목록 전체를 선택하거나 해제한다. */
  function setAllChecked(checked: boolean) {
    setSelectedIds(checked ? new Set(items.map((i) => i.id)) : new Set());
  }

  return (
    <>
      <SectionHeader leading="back" onLeadingClick={() => router.back()} title="반품 접수" />

      <div className="bg-surface-secondary flex min-h-0 flex-1 flex-col">
        <div className="bg-surface mx-3.75 mt-7 flex flex-col rounded-xl px-4 pt-2 pb-5">
          <div className="flex flex-col gap-2">
            <RefundSelectAllBar
              selectedCount={selectedCount}
              totalCount={totalCount}
              onToggleAll={setAllChecked}
            />
            <div className="border-border border-t" />
          </div>

          <ul className="mt-4 flex flex-col">
            {items.map((item, index) => (
              <li
                key={item.id}
                className={index === 0 ? undefined : 'border-border mt-4 border-t pt-4'}
              >
                <RefundLineItem
                  name={item.name}
                  imageSrc={item.imageSrc}
                  price={item.price}
                  quantity={item.quantity}
                  checked={selectedIds.has(item.id)}
                  onCheckedChange={(checked) => setItemChecked(item.id, checked)}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-surface sticky bottom-0 mt-auto px-4 py-3">
          <Button
            variant="black"
            size="l"
            disabled={!canNext}
            className="h-14 w-full"
            onClick={goToReasonStep}
          >
            다음
          </Button>
        </div>
      </div>
    </>
  );
}
