import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { SocialLoginPanel } from './SocialLoginPanel';

const queryClient = new QueryClient();

const meta = {
  title: 'organisms/auth/SocialLoginPanel',
  component: SocialLoginPanel,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="max-w-md">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof SocialLoginPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 — 네이버·카카오 버튼. 클릭 시 `useSocialLogin` 이 제공자 동의화면으로 이동시킨다. */
export const Default: Story = {};
