import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { HomeSectionHeader } from './HomeSectionHeader';

const meta = {
  title: 'molecules/shared/HomeSectionHeader',
  component: HomeSectionHeader,
  args: {
    title: '🛒 지금 가장 많이 담는 특가',
    subtitle: '꼭 담아야 할 추천 특가템 최대 50% OFF',
    href: '/products?sort=popular',
  },
  argTypes: {
    ad: { control: 'boolean' },
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
} satisfies Meta<typeof HomeSectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 부제형(node 2429-2288) — 제목 + 부제 + "전체보기" 링크. */
export const Default: Story = {};

/** 링크 없음 — `href` 미지정. */
export const WithoutLink: Story = {
  args: { href: undefined },
};

/** 부제 없음 — 제목이 `text-heading-4`(16/600)로 줄어든다. */
export const WithoutSubtitle: Story = {
  args: { subtitle: undefined },
};

/** 제목만. */
export const TitleOnly: Story = {
  args: { subtitle: undefined, href: undefined },
};

/**
 * 표준형(node 2757-2678) — 제목 + "광고" 라벨 + "전체보기" 링크. 부제 없음.
 * 광고 섹션 상단에 쓴다.
 */
export const WithAdLabel: Story = {
  args: {
    title: '고객들은 이렇게 활용해요',
    subtitle: undefined,
    ad: true,
    href: '/products?collection=ugc',
  },
};

/** 표준형에서 링크까지 없는 경우 — 제목 + "광고" 라벨만. */
export const AdLabelTitleOnly: Story = {
  args: {
    title: '고객들은 이렇게 활용해요',
    subtitle: undefined,
    ad: true,
    href: undefined,
  },
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

/**
 * `ad` 가 true 면 "광고" 라벨이 보인다. 라벨은 링크 바깥에 있어 링크 접근 이름을
 * 오염시키지 않는다(광고 고지는 화면·스크린리더 모두에 노출돼야 하므로 텍스트로 둔다).
 */
export const ShowsAdLabel: Story = {
  tags: ['!autodocs'],
  args: {
    title: '고객들은 이렇게 활용해요',
    subtitle: undefined,
    ad: true,
    href: '/products?collection=ugc',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const adLabel = canvas.getByText('광고');
    await expect(adLabel).toBeVisible();
    await expect(adLabel.closest('a')).toBeNull();
    await expect(canvas.getByRole('link')).toHaveAccessibleName(
      '고객들은 이렇게 활용해요 전체보기',
    );
  },
};
