import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, waitFor } from 'storybook/test';

import { SplashScreen } from './SplashScreen';

/**
 * 상태 커버리지는 Figma 핸드오프 그대로 Default 1개뿐(structure §6-1) — 정적 화면이라
 * Loading/Empty/Error 가 설계상 없다. play 함수는 "노출 → 일정 시간 후 자동으로
 * 사라짐"이라는 유일한 동작만 검증한다. 로고가 `aria-hidden` 장식 SVG(role/접근 가능한
 * 이름 없음)라 역할/텍스트 쿼리 대신 고유 클래스(`.z-splash`)로 오버레이 노드를 직접
 * 찾는다(HeroBanner 스토리와 동일 패턴).
 */
const meta = {
  title: 'organisms/shared/SplashScreen',
  component: SplashScreen,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SplashScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    expect(canvasElement.querySelector('.z-splash')).toBeInTheDocument();

    await waitFor(() => expect(canvasElement.querySelector('.z-splash')).not.toBeInTheDocument(), {
      timeout: 3000,
    });
  },
};
