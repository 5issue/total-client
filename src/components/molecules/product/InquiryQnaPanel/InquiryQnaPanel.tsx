/**
 * 공개 문의글을 펼쳤을 때 보이는 질문/답변 본문 (molecule). Figma "5팀 UI 공유용"
 * `FaqAccordion` property1="On"(node 665:43824) 의 하단 패널 — Q/A 원형 아바타
 * (SF Pro Black 글자, 각각 brand/medium·brand/secondary 배경) + 본문.
 *
 * Figma 본문 중간의 빈 줄(제로폭 공백 문단)은 ` `(줄바꿈은 유지하되 시각적으로는
 * 빈 줄)로 재현 — 완전한 빈 문자열이면 일부 브라우저가 그 `<p>` 줄 높이를 접어버린다.
 */
export type InquiryQnaPanelProps = {
  question: string[];
  answer: string[];
  className?: string;
};

function Avatar({ variant }: { variant: 'question' | 'answer' }) {
  return (
    <span
      aria-hidden
      className={[
        'flex size-6 shrink-0 items-center justify-center rounded-full',
        variant === 'question' ? 'bg-brand-300' : 'bg-brand-secondary',
      ].join(' ')}
    >
      <span className="font-numeric text-numeric-m text-fg-inverse">
        {variant === 'question' ? 'Q' : 'A'}
      </span>
    </span>
  );
}

function MessageLines({ lines }: { lines: string[] }) {
  return (
    <div className="text-body-s text-fg min-w-0 flex-1">
      {lines.map((line, i) => (
        <p key={i} className={i < lines.length - 1 ? 'mb-0' : undefined}>
          {line || ' '}
        </p>
      ))}
    </div>
  );
}

export function InquiryQnaPanel({ question, answer, className }: InquiryQnaPanelProps) {
  return (
    <div
      className={['bg-surface-subtle flex w-full flex-col gap-6 px-4 py-5', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex w-full items-start gap-4">
        <Avatar variant="question" />
        <MessageLines lines={question} />
      </div>
      <div className="flex w-full items-start gap-4">
        <Avatar variant="answer" />
        <MessageLines lines={answer} />
      </div>
    </div>
  );
}
