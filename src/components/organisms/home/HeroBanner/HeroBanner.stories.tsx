import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';

import { HeroBanner } from './HeroBanner';

const SINGLE_BANNER = [
  {
    imageSrc: '/banners/today-deal.webp',
    imageAlt: '오늘만이 가격, 지금 반값세일 중',
    eyebrow: '오늘만이 가격',
    title: '지금 반값세일 중',
    description: '오늘의 특가 보러 가기',
    href: '/products',
  },
];

// 실제 배너 자산이 1개뿐이라 두 번째/세 번째 슬라이드는 같은 이미지를 재사용한다 —
// 스와이프/자동재생 "기능" 검증용이지 실제 카피가 아니다(#85 리뷰 반영, 2026-09-15).
const MULTI_BANNER = [
  SINGLE_BANNER[0]!,
  {
    imageSrc: '/banners/today-deal.webp',
    imageAlt: '두 번째 배너(목업)',
    eyebrow: '두 번째 배너',
    title: '스와이프 확인용',
    description: '실제 자산 연동 전 목업 슬라이드',
    href: '/products',
  },
  {
    imageSrc: '/banners/today-deal.webp',
    imageAlt: '세 번째 배너(목업)',
    eyebrow: '세 번째 배너',
    title: '자동재생 확인용',
    description: '실제 자산 연동 전 목업 슬라이드',
    href: '/products',
  },
];

const meta = {
  title: 'organisms/home/HeroBanner',
  component: HeroBanner,
  tags: ['autodocs'],
  args: {
    banners: SINGLE_BANNER,
  },
  argTypes: {
    banners: { control: false },
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

/** 기본 — 실제 배너 이미지(node 577:20652, 디자인 시스템 원본 asset node 2429-2351) 1장. */
export const Default: Story = {};

/** `imageSrc` 미지정 시 회색 박스로 대체(퍼블리싱 관례, `CartLineItem` 참고). */
export const NoImage: Story = {
  name: '이미지 없음(회색 박스)',
  args: { banners: [{ ...SINGLE_BANNER[0]!, imageSrc: undefined }] },
};

/** 배너 3장 — 자동재생 없이 정적 확인용(스와이프/자동재생 인터랙션은 아래 전용 스토리). */
export const MultiSlide: Story = {
  name: '배너 3장(목업)',
  args: { banners: MULTI_BANNER },
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
    await expect(canvas.getByRole('link', { name: '전체보기, 현재 1 / 전체 1' })).toHaveAttribute(
      'href',
      '/products',
    );
  },
};

/** 좌우 스와이프(터치)로 배너가 순환 이동한다 — 마지막에서 다음은 처음으로(#85 리뷰). */
export const SwipeGesture: Story = {
  tags: ['!autodocs'],
  args: { banners: MULTI_BANNER },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('link', { name: '전체보기, 현재 1 / 전체 3' }),
    ).toBeInTheDocument();

    const surface = canvasElement.querySelector('.aspect-hero-banner');
    if (!surface) throw new Error('배너 표면을 찾을 수 없습니다');
    // jsdom/브라우저 환경 모두에서 `TouchEventInit.touches`는 실제 `Touch` 인스턴스를
    // 요구한다 — 일반 객체 리터럴을 넘기면 "Failed to convert value to 'Touch'" 로 실패
    // (SwipeTabShell 스토리와 동일 이유).
    const touch = (clientX: number, clientY: number) =>
      new Touch({ identifier: 0, target: surface, clientX, clientY });

    // 왼쪽으로 스와이프 = 다음 배너(useSwipeTabNavigation 과 동일 방향 규칙).
    fireEvent.touchStart(surface, { touches: [touch(300, 100)] });
    fireEvent.touchEnd(surface, { changedTouches: [touch(200, 100)] });
    await expect(
      canvas.getByRole('link', { name: '전체보기, 현재 2 / 전체 3' }),
    ).toBeInTheDocument();

    // 마지막 배너에서 한 번 더 왼쪽 스와이프 → 처음으로 순환.
    fireEvent.touchStart(surface, { touches: [touch(300, 100)] });
    fireEvent.touchEnd(surface, { changedTouches: [touch(200, 100)] });
    fireEvent.touchStart(surface, { touches: [touch(300, 100)] });
    fireEvent.touchEnd(surface, { changedTouches: [touch(200, 100)] });
    await expect(
      canvas.getByRole('link', { name: '전체보기, 현재 1 / 전체 3' }),
    ).toBeInTheDocument();
  },
};

/** 세로 스크롤(deltaY 가 더 큼)은 스와이프로 인정하지 않는다 — #69 재현 버그와 동일 기준. */
export const VerticalDragIsIgnored: Story = {
  tags: ['!autodocs'],
  args: { banners: MULTI_BANNER },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const surface = canvasElement.querySelector('.aspect-hero-banner');
    if (!surface) throw new Error('배너 표면을 찾을 수 없습니다');
    const touch = (clientX: number, clientY: number) =>
      new Touch({ identifier: 0, target: surface, clientX, clientY });

    fireEvent.touchStart(surface, { touches: [touch(300, 100)] });
    fireEvent.touchEnd(surface, { changedTouches: [touch(260, 260)] });

    await expect(
      canvas.getByRole('link', { name: '전체보기, 현재 1 / 전체 3' }),
    ).toBeInTheDocument();
  },
};

/** 자동재생 타이머가 실제로 배너를 넘긴다 — 일시정지하면 멈춘다. */
export const AutoplayAdvances: Story = {
  tags: ['!autodocs'],
  args: { banners: MULTI_BANNER },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('link', { name: '전체보기, 현재 1 / 전체 3' }),
    ).toBeInTheDocument();

    await waitFor(
      () =>
        expect(canvas.getByRole('link', { name: '전체보기, 현재 2 / 전체 3' })).toBeInTheDocument(),
      { timeout: 6000 },
    );

    await userEvent.click(canvas.getByRole('button', { name: '배너 자동 재생 일시정지' }));
    const pausedLabel = canvas.getByRole('link', { name: '전체보기, 현재 2 / 전체 3' }).textContent;
    await new Promise((resolve) => setTimeout(resolve, 4500));
    await expect(
      canvas.getByRole('link', { name: '전체보기, 현재 2 / 전체 3' }).textContent,
    ).toEqual(pausedLabel);
  },
};
