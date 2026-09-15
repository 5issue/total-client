import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, within } from 'storybook/test';

import { QuickMenuSection } from './QuickMenuSection';

const meta = {
  title: 'organisms/home/QuickMenuSection',
  component: QuickMenuSection,
  tags: ['autodocs'],
  argTypes: {
    className: { control: false },
  },
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

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

/** 스크롤 위치에 따라 ScrollIndicator 가 좌/중/우로 이동한다. */
export const ScrollUpdatesIndicator: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scrollable = canvasElement.querySelector<HTMLElement>('[class*="overflow-x-auto"]');
    if (!scrollable) throw new Error('스크롤 컨테이너를 찾지 못했다');

    const indicator = canvas.getByRole('img', { name: '퀵메뉴 가로 스크롤 위치' });
    const dot = indicator.querySelector('span');
    if (!dot) throw new Error('인디케이터 점을 찾지 못했다');

    await expect(dot.className).toContain('translate-x-0');

    const maxScroll = scrollable.scrollWidth - scrollable.clientWidth;

    fireEvent.scroll(scrollable, { target: { scrollLeft: maxScroll / 2 } });
    await expect(dot.className).toContain('translate-x-4');

    fireEvent.scroll(scrollable, { target: { scrollLeft: maxScroll } });
    await expect(dot.className).toContain('translate-x-8');
  },
};
