'use client';

import { useState } from 'react';

import { InquiryItem } from '@/components/molecules/product/InquiryItem';
import { InquiryQnaPanel } from '@/components/molecules/product/InquiryQnaPanel';
import { Modal } from '@/components/molecules/shared/Modal';

import { MOCK_INQUIRIES } from './mock';

/**
 * "문의" 탭 전체 콘텐츠 (organism). Figma "5팀 UI 공유용" node 665-43879(기본 목록) +
 * 665-43924(비밀글 클릭 시 알림 모달) + 665-43824(공개글 펼침).
 *
 * 비밀글을 누르면 "비밀글입니다." 알림 모달(`SystemAlertModal`, node 665:43968)이 뜬다.
 * 공개글(자물쇠 없음)을 누르면 그 아래 질문/답변이 펼쳐진다 — 한 번에 하나만 펼치는
 * 아코디언(Figma에 여러 개 동시 펼침 예시가 없어 가장 단순한 동작으로 구현).
 *
 * 알림 모달 딤 배경(`DimmedOverlay`, node 665:43966)은 헤더·탭바·하단 CTA 바를
 * 가리지 않고 그 사이 콘텐츠만 덮는다 — 실측 결과 그 두 sticky 요소가 z-30(헤더)·
 * z-30(CTA 바, ProductDetailView 에서 override)이라 이 모달만 z-20으로 낮춰
 * 자연스럽게 그 밑에 깔리게 했다. 색도 `--overlay` 토큰(#22222299)이 아니라 Figma
 * 실측 그대로 `rgba(0,0,0,0.5)`(`bg-black/50`).
 */
export function InquiryTab() {
  const [lockedAlertOpen, setLockedAlertOpen] = useState(false);
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
