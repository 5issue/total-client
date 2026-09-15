'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/Button';
import { RefundLineItem } from '@/components/molecules/mypage/RefundLineItem';
import { RefundSelectAllBar } from '@/components/molecules/mypage/RefundSelectAllBar';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';

import { MOCK_REFUND_ITEMS } from './mock';

/**
 * 반품 접수 화면 컨테이너 (organism). Figma "5팀 UI 공유용" —
 * 미선택 848-82641 / 일부 선택 848-82701 / 전체 선택 848-82764.
 *
 * 퍼블리싱 단계: 선택만 로컬 state. `다음` 은 `/mypage/orders/return/reason` 으로 이동.
 * page.tsx 는 이 컴포넌트만 렌더한다(RSC 유지).
 *
 * 헤더 타이틀은 "반품 접수". 하단 CTA 는 `Button` black `size="l"` 풀폭 "다음" —
 * 미선택 시 disabled (`neutral-700` + `fg-disabled`). 활성은 공용 `black`.
 *
 * 헤더↔목록 `mt-7`, 목록 좌우 `mx-3.75`, 내부 `px-4 pt-2 pb-5`.
 * 구분선 위·아래는 `mt-4` / `pt-4` / `pb-4`.
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

  function setItemChecked(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function setAllChecked(checked: boolean) {
    setSelectedIds(checked ? new Set(items.map((i) => i.id)) : new Set());
  }

  return (
    <>
      <SectionHeader leading="back" onLeadingClick={() => router.back()} title="반품 접수" />

      <div className="bg-surface-secondary flex min-h-0 flex-1 flex-col">
        <div className="bg-surface mx-3.75 mt-7 flex min-h-0 flex-1 flex-col px-4 pt-2 pb-5">
          <RefundSelectAllBar
            selectedCount={selectedCount}
            totalCount={totalCount}
            onToggleAll={setAllChecked}
          />
          <div className="border-border mt-4 border-t" />

          <ul className="flex flex-col">
            {items.map((item) => (
              <li key={item.id} className="border-border border-b py-4 last:border-b-0 last:pb-0">
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

        <div className="bg-surface px-4 pt-2 pb-2">
          <Button
            variant="black"
            size="l"
            disabled={!canNext}
            className="h-14 w-full"
            onClick={() => router.push('/mypage/orders/return/reason')}
          >
            다음
          </Button>
        </div>
      </div>
    </>
  );
}
