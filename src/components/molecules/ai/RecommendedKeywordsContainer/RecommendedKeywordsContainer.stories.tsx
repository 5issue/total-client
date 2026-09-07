import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { RecommendedKeywordsContainer } from './RecommendedKeywordsContainer';

const meta = {
  title: 'molecules/ai/RecommendedKeywordsContainer',
  component: RecommendedKeywordsContainer,
  tags: ['autodocs'],
  args: {
    title: '우유, 함께 골라볼까요?',
    description:
      '우유는 용량과 포장 형태도 중요해요. 한 번에 마실지, 오래 두고 쓸지에 따라 골라보세요.',
    promptLabel: '궁금한 키워드를 선택해주세요',
    keywords: ['라떼용', '딸기라테용', '온가족용', '하루 아침용', '멸균'],
    onSelectKeyword: fn(),
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RecommendedKeywordsContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Figma "Recommended" variant (node 2683-4991) — 다시 추천 받기 칩 포함. */
export const RecommendedVariant: Story = {
  name: '식단 선호 조사 (다시 추천 받기 포함)',
  args: {
    title: '어떤 식단을 선호하세요?',
    description:
      '선택하신 선호 식단과 인기상품, 구매이력을 기반으로 AI가 맞춤 상품과 레시피를 추천해드려요!',
    promptLabel: '선호하는 식단를 선택해주세요',
    keywords: [
      '과일과 채소 위주의 비건식',
      '단백질 중심의 다이어트 식단',
      '육류 중심의 든든한 식단',
      '밀키트·레토르트 위주의 간편식',
    ],
    onReset: fn(),
  },
};

export const ClickKeyword: Story = {
  name: '키워드 클릭 시 핸들러 호출',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '라떼용' }));
    await expect(args.onSelectKeyword).toHaveBeenCalledWith('라떼용');
  },
};
