'use client';

import { useState } from 'react';

import { InquiryItem } from '@/components/molecules/product/InquiryItem';
import { InquiryQnaPanel } from '@/components/molecules/product/InquiryQnaPanel';
import { Modal } from '@/components/molecules/shared/Modal';

import { MOCK_INQUIRIES } from './mock';

/**
 * "문의" 탭 전체 콘텐츠 (organism). Figma "5팀 UI 공유용" node 665-43879(기본 목록) +
 * 665-43924(비밀글 알림 모달) + 665-43824(공개글 펼침).
 *
 * 비밀글을 누르면 "비밀글입니다." 알림 모달이 뜬다. 공개글(자물쇠 없음)을 누르면
 * 그 아래 질문/답변이 펼쳐진다 — 한 번에 하나만 펼치는 아코디언.
 *
 * 알림 모달은 헤더·하단 CTA 바(둘 다 z-30)보다 낮은 z-20 오버레이를 쓴다(`Modal`
 * 의 `overlayClassName` override) — 그 두 sticky 요소만 딤 위로 밝게 남기기 위함.
 * 색도 Figma 실측 그대로 `rgba(0,0,0,0.5)`(`bg-black/50`, 공용 `--overlay` 토큰과 다름).
 * 다만 딤 위에 밝게 뜨는 것과 별개로 그 영역이 여전히 클릭 가능하면 모달이 열린 채로
 * 뒤로가기/장바구니/CTA 를 누를 수 있다 — `onLockedAlertOpenChange` 로 열림 상태를
 * 부모(ProductDetailView)에 올려서, 부모가 그 두 요소에 `pointer-events-none` 을
 * 걸게 한다.
 */
export type InquiryTabProps = {
  /** 비밀글 알림 모달의 열림 상태가 바뀔 때마다 호출 — 부모가 헤더/CTA 바의
   *  포인터 이벤트를 막는 데 쓴다. */
  onLockedAlertOpenChange?: (open: boolean) => void;
};

export function InquiryTab({ onLockedAlertOpenChange }: InquiryTabProps) {
  const [lockedAlertOpen, setLockedAlertOpenState] = useState(false);

  function setLockedAlertOpen(open: boolean) {
    setLockedAlertOpenState(open);
    onLockedAlertOpenChange?.(open);
  }

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="flex w-full flex-col">
      {MOCK_INQUIRIES.map((item, i) =>
        item.locked ? (
          <InquiryItem
            key={i}
            locked
            title="비밀글입니다."
            answerLabel={item.answerLabel}
            author={item.author}
            date={item.date}
            onClick={() => setLockedAlertOpen(true)}
          />
        ) : (
          <div key={i} className="flex w-full flex-col">
            <InquiryItem
              locked={false}
              title={item.title}
              answerLabel={item.answerLabel}
              author={item.author}
              date={item.date}
              expanded={expandedIndex === i}
              onClick={() => setExpandedIndex((prev) => (prev === i ? null : i))}
            />
            {expandedIndex === i ? (
              <InquiryQnaPanel question={item.question} answer={item.answer} />
            ) : null}
          </div>
        ),
      )}

      <Modal
        open={lockedAlertOpen}
        onClose={() => setLockedAlertOpen(false)}
        title="비밀글입니다."
        titleClassName="text-heading-5 text-fg"
        cardClassName="flex w-94 flex-col gap-6 rounded-lg px-6 pt-6 pb-2"
        overlayClassName="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-4"
      >
        <div className="flex w-full justify-end">
          <button
            type="button"
            onClick={() => setLockedAlertOpen(false)}
            className="text-heading-4 text-primary px-4 py-2"
          >
            확인
          </button>
        </div>
      </Modal>
    </div>
  );
}
