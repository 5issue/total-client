'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

import Image from 'next/image';

import { Accordion } from '@/components/molecules/shared/Accordion';

/**
 * 주문 상품 목록 아코디언 (molecule).
 * Figma "5팀 디자인 시스템" — node 2461-8555 "Accordion_Order".
 *
 * `Accordion` 셸 + 배송 묶음(라벨 + 구분선). 상품 카드는 `children` 으로 받아
 * 카드 종류에 무관하다 — Figma `Item_H_Order` 가 바뀌어도 이 셸은 그대로.
 *
 * - 헤더(타이틀) 박스는 Off·On 동일하게 60px(`min-h-15`) — 펼쳐지는 영역과 헤더를 구분.
 * - Off(접힘) 상태에서는 헤더 아래에 요약 문구 + 썸네일 미리보기를 보여준다(`summary`/`thumbnailUrls`).
 *   `open` 을 직접 물고 있어야 접힘 여부에 따라 미리보기 ↔ 펼친 내용을 바꿔 렌더할 수 있다.
 */
export interface AccordionOrderProps {
  title?: string;
  /** 배송 묶음 라벨(예: "샛별배송"). 없으면 라벨·구분선 생략. */
  deliveryLabel?: string;
  /** Off 상태 요약 문구(예: `[풀무원] 고소한 유기농 순두부 (2개입) 외 1건`). */
  summary?: string;
  /**
   * Off 상태 미리보기 썸네일(최대 4개). `public/` 기준 내부 절대 경로(`/…`)만 렌더하고
   * 외부 URL 은 `next.config` 설정이 필요해 placeholder 로 둔다.
   */
  thumbnailUrls?: string[];
  /** 상품 카드. */
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function AccordionOrder({
  title = '주문상품',
  deliveryLabel = '샛별배송',
  summary,
  thumbnailUrls,
  children,
  defaultOpen = false,
  className,
}: AccordionOrderProps) {
  const [open, setOpen] = useState(defaultOpen);

  const previews = (thumbnailUrls ?? []).slice(0, 4);
  const showPreview = !open && (Boolean(summary) || previews.length > 0);

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      <Accordion header={title} open={open} onToggle={setOpen} headerClassName="min-h-15 px-4">
        <div className="px-4 pt-2 pb-4">
          <div className="border-border rounded-xl border px-4 pt-4 pb-5">
            {deliveryLabel ? (
              <>
                <p className="text-heading-5 text-fg mb-3">{deliveryLabel}</p>
                <div className="border-border mb-3 border-t" />
              </>
            ) : null}
            <div className="flex flex-col gap-4.5">{children}</div>
          </div>
        </div>
      </Accordion>

      {showPreview ? (
        <div className="flex flex-col gap-3 px-4 pb-4">
          {summary ? <p className="text-label-l text-fg">{summary}</p> : null}
          {previews.length > 0 ? (
            <div className="flex gap-3">
              {previews.map((url, i) => (
                <div
                  key={`${url}-${i}`}
                  className="bg-fg-disabled relative size-13 shrink-0 overflow-hidden rounded-sm"
                >
                  {url.startsWith('/') ? (
                    <Image src={url} alt="" fill sizes="52px" className="object-cover" />
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
