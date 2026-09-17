'use client';

import { Icon } from '@/components/atoms/Icon';

/**
 * 문의 목록의 글 한 건 (molecule). Figma "5팀 UI 공유용" `Inquiry_Item_Locked`
 * (node 665:43008 비밀글 / `FaqAccordion` node 1233:118526 공개글) — 전체 행이
 * 버튼이다.
 *
 * `locked=true`(비밀글): 회색 텍스트 + 자물쇠 아이콘, 클릭하면 "비밀글입니다." 알림
 * 모달이 뜬다(부모가 처리). `locked=false`(공개글 — 본인이 작성했거나 공개 설정된
 * 문의글이라 자물쇠가 없다, 사용자 확인 2026-09-16): 클릭하면 아래에 질문/답변 패널이
 * 펼쳐진다(`InquiryQnaPanel`). Figma 원본에 펼침 화살표(쉐브론) 아이콘이 없어 임의로
 * 추가하지 않았다.
 */
export type InquiryItemProps = {
  locked: boolean;
  title: string;
  answerLabel: string;
  author: string;
  date: string;
  expanded?: boolean;
  onClick?: () => void;
  className?: string;
};

function Separator() {
  return <span aria-hidden className="h-2.5 w-px bg-neutral-400" />;
}

export function InquiryItem({
  locked,
  title,
  answerLabel,
  author,
  date,
  expanded,
  onClick,
  className,
}: InquiryItemProps) {
  return (
    // padding 은 border 위치를 안 바꾼다 — 구분선(border-b)을 화면 양끝에서 16px
    // 띄우려면 버튼이 아니라 바깥 wrapper 에 px-4 를 줘야 한다.
    <div className="w-full px-4">
      <button
        type="button"
        onClick={onClick}
        aria-expanded={locked ? undefined : expanded}
        className={[
          'flex w-full flex-col items-start gap-1 border-b border-neutral-400 py-4 text-left',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className="inline-flex items-center gap-1">
          <span className={locked ? 'text-body-s text-fg-disabled' : 'text-body-s text-fg'}>
            {title}
          </span>
          {locked ? <Icon name="lock" size={20} aria-hidden className="text-fg-disabled" /> : null}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="text-label-m text-primary">{answerLabel}</span>
          <Separator />
          <span className="text-label-xs text-fg-disabled">{author}</span>
          <Separator />
          <span className="text-label-xs text-fg-disabled">{date}</span>
        </span>
      </button>
    </div>
  );
}
