import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { StatusLabel, type StatusLabelType } from './StatusLabel';

const TYPES: StatusLabelType[] = [
  'owned',
  'subscribed',
  'inactive',
  'notice',
  'rewards',
  'defaultAddress',
  'kurlyOnly',
  'adLabelS',
  'adLabelL',
  'adLabelM',
  'kbank',
];

/** Figma 예시 카피 그대로 — type 마다 실제로 쓰이는 문구가 달라 하드코딩한다. */
const SAMPLE_CHILDREN: Record<StatusLabelType, string> = {
  owned: '보유중',
  subscribed: '구독중',
  inactive: '상품권 미보유',
  notice: '공지',
  rewards: '혜택',
  defaultAddress: '기본배송지',
  kurlyOnly: 'Kurly Only',
  adLabelS: '광고',
  adLabelL: '광고',
  adLabelM: '광고',
  kbank: '케이뱅크 충전결제 3% 추가적립',
};

const meta = {
  title: 'molecules/shared/StatusLabel',
  component: StatusLabel,
  tags: ['autodocs'],
  args: {
    type: 'owned',
    children: SAMPLE_CHILDREN.owned,
  },
  argTypes: {
    type: { control: 'select', options: TYPES },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof StatusLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {TYPES.map((type) => (
        <StatusLabel key={type} type={type}>
          {SAMPLE_CHILDREN[type]}
        </StatusLabel>
      ))}
    </div>
  ),
};
