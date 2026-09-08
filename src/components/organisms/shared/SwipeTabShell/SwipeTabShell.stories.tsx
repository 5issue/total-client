import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { getRouter } from '@storybook/nextjs-vite/navigation.mock';
import { expect, fireEvent, within } from 'storybook/test';

import { SwipeTabShell } from './SwipeTabShell';

/**
 * "BottomNav 바 위에서만"이 아니라 화면 어디서든 스와이프해도 탭이 전환돼야 한다는 요구
 * (디자인팀, PR #58 리뷰)를 검증한다 — 그래서 play() 는 일부러 내비게이션 바가 아닌 일반
 * 콘텐츠 영역(`data-testid="content"`)에서 터치를 시작한다.
 */
const meta = {
  title: 'organisms/shared/SwipeTabShell',
  component: SwipeTabShell,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/' } },
  },
  args: {
    children: (
      <div data-testid="content" className="flex h-40 items-center justify-center">
        일반 화면 콘텐츠 (스와이프 시작 지점)
      </div>
    ),
  },
} satisfies Meta<typeof SwipeTabShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SwipeAnywhereToNextTab: Story = {
  name: '화면 아무 곳에서 스와이프 → 다음 탭',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByTestId('content');
    // jsdom/브라우저 환경 모두에서 `TouchEventInit.touches`는 실제 `Touch` 인스턴스를
    // 요구한다 — 일반 객체 리터럴을 넘기면 "Failed to convert value to 'Touch'" 로 실패.
    const touch = (clientX: number, clientY: number) =>
      new Touch({ identifier: 0, target: content, clientX, clientY });

    // 탭(작은 움직임) — 임계값 미만이라 내비게이션이 없어야 한다.
    fireEvent.touchStart(content, { touches: [touch(300, 100)] });
    fireEvent.touchEnd(content, { changedTouches: [touch(295, 100)] });
    await expect(getRouter().push).not.toHaveBeenCalled();

    // 왼쪽 스와이프 — 홈(index 0) 다음인 라운지로 이동해야 한다.
    fireEvent.touchStart(content, { touches: [touch(300, 100)] });
    fireEvent.touchEnd(content, { changedTouches: [touch(200, 100)] });
    await expect(getRouter().push).toHaveBeenCalledWith('/lounge');
  },
};
