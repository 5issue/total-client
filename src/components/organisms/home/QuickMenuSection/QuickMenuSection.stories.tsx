import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { QuickMenuSection } from './QuickMenuSection';

const meta = {
  title: 'organisms/home/QuickMenuSection',
  component: QuickMenuSection,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QuickMenuSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 — 2행×11개 프로모션 아이콘, 가로 스크롤 (node 577:20653). */
export const Default: Story = {};
