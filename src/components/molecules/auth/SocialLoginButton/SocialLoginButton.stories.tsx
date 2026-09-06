import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { SocialLoginButton, type SocialProvider } from './SocialLoginButton';

const PROVIDERS: SocialProvider[] = ['naver', 'kakao', 'apple', 'kurly'];

const meta = {
  title: 'molecules/auth/SocialLoginButton',
  component: SocialLoginButton,
  tags: ['autodocs'],
  args: {
    provider: 'naver',
    onClick: fn(),
  },
  argTypes: {
    provider: {
      control: 'select',
      options: PROVIDERS,
    },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SocialLoginButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Naver: Story = {
  args: { provider: 'naver' },
};

export const Kakao: Story = {
  args: { provider: 'kakao' },
};

export const Apple: Story = {
  args: { provider: 'apple' },
};

export const Kurly: Story = {
  name: '컬리 아이디 로그인 (아이콘 없음)',
  args: { provider: 'kurly' },
};

export const AllProviders: Story = {
  name: `전체 (${PROVIDERS.length}종)`,
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {PROVIDERS.map((provider) => (
        <SocialLoginButton key={provider} provider={provider} />
      ))}
    </div>
  ),
};

export const ClickInteraction: Story = {
  name: '클릭 시 핸들러 호출',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: '네이버로 계속하기' });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
