import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ReviewerBadge } from './ReviewerBadge';

const meta = {
  title: 'molecules/product/ReviewerBadge',
  component: ReviewerBadge,
  tags: ['autodocs'],
  args: {
    username: '정**',
    badge: { color: 'purple', size: 'small', children: '베스트' },
  },
  argTypes: {
    username: { control: 'text' },
    badge: { control: 'object' },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ReviewerBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Best: Story = {};

export const Membership: Story = {
  args: { badge: { color: 'cyan', size: 'small', children: '멤버스' } },
};

export const NoBadge: Story = {
  args: { badge: undefined },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <ReviewerBadge
        username="정**"
        badge={{ color: 'purple', size: 'small', children: '베스트' }}
      />
      <ReviewerBadge username="김**" badge={{ color: 'cyan', size: 'small', children: '멤버스' }} />
      <ReviewerBadge username="이**" />
    </div>
  ),
};
