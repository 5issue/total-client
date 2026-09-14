import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { HeroBanner } from './HeroBanner';

const meta = {
  title: 'organisms/home/HeroBanner',
  component: HeroBanner,
  tags: ['autodocs'],
  args: {
    imageSrc: '/banners/today-deal.webp',
    imageAlt: '오늘만이 가격, 지금 반값세일 중',
    eyebrow: '오늘만이 가격',
    title: '지금 반값세일 중',
    description: '오늘의 특가 보러 가기',
    href: '/products',
    current: 4,
    total: 30,
  },
  argTypes: {
    current: { control: 'number' },
    total: { control: 'number' },
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
} satisfies Meta<typeof HeroBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 — 실제 배너 이미지 (node 577:20652, 디자인 시스템 원본 asset node 2429-2351). */
export const Default: Story = {};

/** `imageSrc` 미지정 시 회색 박스로 대체(퍼블리싱 관례, `CartLineItem` 참고). */
export const NoImage: Story = {
  name: '이미지 없음(회색 박스)',
  args: { imageSrc: undefined },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

/** 재생/일시정지 버튼은 아이콘 대신 aria-pressed/aria-label 로만 상태를 알린다. */
export const PlayPauseToggle: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: '배너 자동 재생 일시정지' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(toggle);
    await expect(canvas.getByRole('button', { name: '배너 자동 재생 시작' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  },
};

/** 전체보기 링크는 목적지 + 현재 순번을 서술한다(code-style §5). */
export const ViewAllLink: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: '전체보기, 현재 4 / 전체 30' })).toHaveAttribute(
      'href',
      '/products',
    );
  },
};
