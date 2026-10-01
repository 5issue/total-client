import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, waitFor } from 'storybook/test';

import { SplashScreen } from './SplashScreen';

/**
 * 상태 커버리지는 Figma 핸드오프 그대로 Default 1개뿐(structure §6-1) — 정적 화면이라
 * Loading/Empty/Error 가 설계상 없다. play 함수는 "노출 → 일정 시간 후 자동으로
 * 사라짐"이라는 유일한 동작만 검증한다. 로고가 `aria-hidden` 장식 SVG(role/접근 가능한
 * 이름 없음)라 역할/텍스트 쿼리 대신 고유 클래스(`.z-splash`)로 오버레이 노드를 직접
 * 찾는다(HeroBanner 스토리와 동일 패턴).
 *
 * `SplashScreen`이 같은 탭에서는 `sessionStorage`로 한 번만 보이게 막기 때문에, 같은
 * 브라우저 세션(페이지)에서 이 스토리가 두 번째로 실행되면(재시도·HMR 등) 플래그가
 * 이미 꽂혀 있어 스플래시가 아예 안 뜬다 — `useSyncExternalStore`가 마운트 즉시(페인트
 * 전) 그 값을 읽어버려 `play`에서 지우면 이미 늦는다. 렌더 전에 지우는 decorator로
 * 매 실행이 "처음 보는 세션"인 것처럼 멱등하게 만든다.
 */
const meta = {
  title: 'organisms/shared/SplashScreen',
  component: SplashScreen,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      sessionStorage.removeItem('splash-shown');
      return <Story />;
    },
  ],
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
