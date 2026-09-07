'use client';

import { Logo } from '@/components/atoms/Logo/Logo';

/**
 * AI 채팅 메시지 (Figma "Answer" node 2446-1603 / "Question" node 2446-1606 —
 * 후자는 이름과 달리 실제로는 AI 응답이라 `assistant` 로 부른다).
 * `user`: 보라색 말풍선, 우측 정렬, 우하단만 각짐(radius-s).
 * `assistant`: 말풍선 배경 없이 컬리 아바타 + 제목 + 보조 설명.
 */
export type ChatBubbleProps = { className?: string } & (
  { role: 'user'; message: string } | { role: 'assistant'; title: string; description: string }
);

export function ChatBubble(props: ChatBubbleProps) {
  if (props.role === 'user') {
    return (
      <div className={['flex justify-end py-4', props.className].filter(Boolean).join(' ')}>
        <p className="text-label-l rounded-br-s bg-brand-300 max-w-[300px] rounded-tl-xl rounded-tr-xl rounded-bl-xl px-4 py-3 text-white">
          {props.message}
        </p>
      </div>
    );
  }

  return (
    <div className={['flex flex-col gap-1', props.className].filter(Boolean).join(' ')}>
      <Logo name="chat-kurly-2" height={32} aria-hidden />
      <div className="flex flex-col gap-2">
        <p className="text-heading-1 text-fg">{props.title}</p>
        <p className="text-label-m text-fg-secondary">{props.description}</p>
      </div>
    </div>
  );
}
