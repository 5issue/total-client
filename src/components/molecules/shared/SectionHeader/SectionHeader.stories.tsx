import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { SectionHeader } from './SectionHeader';

const meta = {
  title: 'molecules/shared/SectionHeader',
  component: SectionHeader,
  args: {
    title: '🛒 지금 가장 많이 담는 특가',
    subtitle: '꼭 담아야 할 추천 특가템 최대 50% OFF',
    href: '/products?sort=popular',
  },
  argTypes: {
    headingLevel: { control: 'inline-radio', options: [2, 3, 4] },
    href: { control: 'text' },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 — 제목 + 부제 + "전체보기" 링크. */
export const Default: Story = {};

/** 링크 없음 — `href` 미지정. */
export const WithoutLink: Story = {
  args: { href: undefined },
};

/** 부제 없음. */
export const WithoutSubtitle: Story = {
  args: { subtitle: undefined },
};

/** 제목만. */
export const TitleOnly: Story = {
  args: { subtitle: undefined, href: undefined },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

/**
 * `href` 가 있으면 링크가 그 경로로 렌더된다. 접근 가능한 이름은 "더보기" 단독이 아니라
 * 제목을 포함(code-style §5 "링크는 목적지를 설명") — 화면엔 "전체보기"만 보인다.
 */
export const RendersLink: Story = {
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: '🛒 지금 가장 많이 담는 특가 전체보기' });
    await expect(link).toHaveAttribute('href', '/products?sort=popular');
    await expect(link).toHaveTextContent('전체보기');
  },
};

/** `href` 가 없으면 링크를 렌더하지 않는다. */
export const NoLinkWhenNoHref: Story = {
  tags: ['!autodocs'],
  args: { href: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('link')).not.toBeInTheDocument();
  },
};

/** heading 레벨은 페이지 문맥에 맞춰 조정 가능. */
export const HeadingLevel3: Story = {
  tags: ['!autodocs'],
  args: { headingLevel: 3 },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('heading', { level: 3, name: '🛒 지금 가장 많이 담는 특가' }),
    ).toBeInTheDocument();
  },
};
