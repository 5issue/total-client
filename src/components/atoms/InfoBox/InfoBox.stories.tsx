import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { Icon } from '@/components/atoms/Icon';

import { InfoBox } from './InfoBox';

/** 안내 아이콘 — Icon atom 의 `info-line` (Figma node 2418-6426 의 원본과 동일 path). */
function InfoIcon() {
  return <Icon name="info-line" className="text-fg-tertiary" aria-hidden />;
}

const meta = {
  title: 'atoms/InfoBox',
  component: InfoBox,
  args: {
    variant: 'notice',
    title: '안내사항',
    children: (
      <>
        <p>
          • [주문완료], [배송준비중] 상태일 경우에만 주문내역 상세페이지에서 주문 취소가 가능합니다.
        </p>
        <p>
          • 엘리베이터 이용이 어려운 경우 6층 이상부터는 공동 현관 앞 또는 경비실로 대응 배송 될 수
          있습니다.
        </p>
        <p>
          • 주문 / 배송 및 기타 문의가 있을 경우, 1:1 문의에 남겨주시면 신속히 해결해드리겠습니다.
        </p>
      </>
    ),
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['notice', 'callout', 'inline', 'bar'] },
    tone: { control: 'inline-radio', options: ['bright', 'dark'] },
    title: { control: 'text' },
    icon: { control: false },
    children: { control: false },
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
} satisfies Meta<typeof InfoBox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma "round=12" — 제목 + 여러 줄 안내. 기본 상태. */
export const Default: Story = {};

/** Figma "round=8, Body=True" — 아이콘 + 제목 + 본문. */
export const Callout: Story = {
  args: {
    variant: 'callout',
    icon: <InfoIcon />,
    title: '확인해주세요',
    children: '비밀번호가 정확하지 않을 경우, 부득이하게 1층 공동현관 앞에 배송될 수 있습니다',
  },
};

/** Figma "round=8, Body=False" — 아이콘 + 한 줄. */
export const Inline: Story = {
  args: {
    variant: 'inline',
    icon: <InfoIcon />,
    children: '만료 후 3일간 비활성화 상태로 유지되며, 이후 자동 삭제돼요',
  },
};

/** Figma "round=8, stroke=True" — 테두리 + 가운데 정렬 한 줄. */
export const Bar: Story = {
  args: {
    variant: 'bar',
    children: '적립금은 주문서에서 적용할 수 있어요',
  },
};

/** `tone="dark"` — 배경만 한 톤 진하게(Semantic/Info_dark). */
export const DarkTone: Story = {
  args: {
    variant: 'callout',
    tone: 'dark',
    icon: <InfoIcon />,
    title: '확인해주세요',
    children: '비밀번호가 정확하지 않을 경우, 부득이하게 1층 공동현관 앞에 배송될 수 있습니다',
  },
};

// --- 접근성 테스트 전용 (autodocs 에서 숨김) ---

export const NoticeRendersTitleAndBody: Story = {
  tags: ['!autodocs'],
  args: {
    variant: 'notice',
    title: '안내사항',
    children: <p>본문 한 줄</p>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('안내사항')).toBeInTheDocument();
    await expect(canvas.getByText('본문 한 줄')).toBeInTheDocument();
  },
};
