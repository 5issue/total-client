import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ImageFrameContainer } from './ImageFrameContainer';

const meta = {
  title: 'atoms/ImageFrameContainer',
  component: ImageFrameContainer,
  tags: ['autodocs'],
  args: {
    src: '/recommended-keywords/peach.png',
    alt: '복숭아',
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ImageFrameContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const List: Story = {
  render: (args) => (
    <div className="flex gap-2">
      <ImageFrameContainer {...args} src="/recommended-keywords/peach.png" alt="복숭아" />
      <ImageFrameContainer {...args} src="/recommended-keywords/kit.png" alt="밀키트" />
      <ImageFrameContainer {...args} src="/recommended-keywords/fish.png" alt="회" />
    </div>
  ),
};
