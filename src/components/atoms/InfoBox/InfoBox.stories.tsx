import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { InfoBox } from './InfoBox';

/**
 * 안내 아이콘 — Icon atom 도입 전까지 스토리 데모용.
 * path 는 Figma node 2418-6426 의 info 아이콘 원본, fill 만 currentColor.
 */
function InfoIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="text-fg-tertiary size-5"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 2C14.4183 2 17.9999 5.5817 18 10C18 14.4184 14.4184 18 10 18C5.5817 17.9999 2 14.4183 2 10C2.00012 5.58177 5.58177 2.00012 10 2ZM10 3.52344C6.42337 3.52355 3.52355 6.42337 3.52344 10C3.52344 13.5767 6.4233 16.4764 10 16.4766C13.5768 16.4766 16.4766 13.5768 16.4766 10C16.4764 6.4233 13.5767 3.52344 10 3.52344ZM10.7617 14.1904H9.23828V8.85742H10.7617V14.1904ZM10.7617 7.33301H9.23828V5.80957H10.7617V7.33301Z"
      />
    </svg>
  );
}

const meta = {
  title: 'atoms/InfoBox',
  component: InfoBox,
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

/** Figma "round=12" — 제목 + 여러 줄 안내. */
export const Notice: Story = {
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
};

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
