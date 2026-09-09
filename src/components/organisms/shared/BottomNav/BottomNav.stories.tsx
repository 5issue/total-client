import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { BottomNav } from './BottomNav';

/**
 * 상태 커버리지는 Figma 핸드오프 그대로: State=Home/Rounge/Category/Search/Mypage
 * (node 2368-429, 2479-2364, 2481-2480, 2481-2541, 2481-2586) 5개 = activeTab 만 다르다.
 * 라우트는 `parameters.nextjs.navigation.pathname` 으로 mock 한다 — usePathname() 이
 * app 디렉토리 전용이라 appDirectory: true 가 함께 필요하다.
 * 스와이프 전환 테스트는 organisms/shared/SwipeTabShell 쪽으로 옮겼다 — 이 컴포넌트는
 * 더 이상 터치 핸들러를 갖지 않는다(PR #58 리뷰: "화면 어디서든" 스와이프 요구로 범위 이동).
 */
const meta = {
  title: 'organisms/shared/BottomNav',
  component: BottomNav,
  tags: ['autodocs'],
  args: {
    badges: {},
  },
  argTypes: {
    badges: { control: 'object' },
  },
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      // BottomNav 는 실제 앱에서도 position:fixed 라 뷰포트 기준으로 뜬다. 이 래퍼가
      // 없으면 Storybook 캔버스 전체 너비를 기준으로 떠버려 Figma 402px 모바일 프레임과
      // 비율이 안 맞게 보인다 — `contain-layout` 으로 이 래퍼를 fixed 자식의 containing
      // block 으로 만들어 402px 안에 가둔다(Figma 프레임 실측 폭 그대로).
      <div className="w-mobile-frame relative mx-auto h-40 overflow-hidden contain-layout">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: { nextjs: { navigation: { pathname: '/' } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const home = canvas.getByRole('link', { name: '홈' });
    await expect(home).toHaveAttribute('href', '/');
    await expect(home).toHaveAttribute('aria-current', 'page');

    const search = canvas.getByRole('link', { name: '검색' });
    await expect(search).toHaveAttribute('href', '/search');
    await expect(search).not.toHaveAttribute('aria-current');
  },
};

export const Lounge: Story = {
  parameters: { nextjs: { navigation: { pathname: '/lounge' } } },
};

export const Category: Story = {
  parameters: { nextjs: { navigation: { pathname: '/category' } } },
};

export const Search: Story = {
  parameters: { nextjs: { navigation: { pathname: '/search' } } },
};

export const Mypage: Story = {
  parameters: { nextjs: { navigation: { pathname: '/mypage' } } },
};

export const LoungeWithBadge: Story = {
  name: '라운지 알림 배지',
  args: { badges: { lounge: true } },
  parameters: { nextjs: { navigation: { pathname: '/' } } },
};
