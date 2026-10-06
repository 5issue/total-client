import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ChatBubble } from './ChatBubble';

const meta = {
  title: 'molecules/ai/ChatBubble',
  component: ChatBubble,
  tags: ['autodocs'],
  args: {
    role: 'user',
    message: '과일과 채소 위주로 추천해줘',
  },
  argTypes: {
    role: { control: 'select', options: ['user', 'assistant'] },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatBubble>;

export default meta;
type Story = StoryObj<typeof ChatBubble>;

export const Default: Story = {
  name: '사용자 메시지',
  args: {
    role: 'user',
    message: '과일과 채소 위주로 추천해줘',
  },
};

export const Assistant: Story = {
  name: 'AI 응답',
  args: {
    role: 'assistant',
    title: '과일과 채소 위주의 비건식에 딱맞는 상품이에요',
    description:
      '지금 이 카테고리에서 실시간으로 가장 많이 구매된 상품과, 준호님의 과거 구매 이력을 함께 반영해 추천해드려요',
  },
};

export const Conversation: Story = {
  name: '대화 흐름 예시',
  render: () => (
    <div className="flex flex-col gap-2">
      <ChatBubble role="user" message="우유 추천해줘" />
      <ChatBubble
        role="assistant"
        title="우유, 함께 골라볼까요?"
        description="우유는 용량과 포장 형태도 중요해요. 한 번에 마실지, 오래 두고 쓸지에 따라 골라보세요."
      />
    </div>
  ),
};
