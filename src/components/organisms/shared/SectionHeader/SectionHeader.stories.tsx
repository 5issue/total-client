import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { SearchBar } from '@/components/atoms/SearchBar';

import { SectionHeader, type SectionHeaderAction } from './SectionHeader';

const CART_ACTION: SectionHeaderAction = { icon: 'cart', label: '장바구니', href: '/cart' };

const ACTIONS: SectionHeaderAction[] = [
  { icon: 'location', label: '배송지 설정', href: '/mypage/addresses' },
  { icon: 'bell', label: '알림', href: '/mypage/notifications' },
  CART_ACTION,
];

const meta = {
  title: 'organisms/shared/SectionHeader',
  component: SectionHeader,
  args: {
    leading: 'back',
    onLeadingClick: fn(),
    title: '마이컬리',
    actions: ACTIONS,
  },
  argTypes: {
    leading: { control: 'inline-radio', options: ['back', 'close'] },
    leadingHref: { control: 'text' },
    onLeadingClick: { control: false },
    center: { control: false },
    actions: { control: false },
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

/** 기본 — 뒤로가기 + 제목 + 배송지·알림·장바구니 (node 2438-1743). */
export const Default: Story = {};

/** 상품 상세 — 뒤로가기 + 제목 + 장바구니만. */
export const SingleAction: Story = {
  args: { title: '유기농 사과 5kg', actions: [CART_ACTION] },
};

/** 검색 — 뒤로가기 + 검색바, 우측 비움 (node 194-10549). */
export const WithSearch: Story = {
  args: {
    title: undefined,
    actions: undefined,
    center: <SearchBar label="상품 검색" />,
  },
};

/** 닫기 + 제목 — 우측 비움. 모달성 화면(장바구니 등)에 쓴다 (node 188-8908). */
export const CloseWithTitle: Story = {
  args: { leading: 'close', title: '장바구니', actions: undefined },
};

/** 제목만 — leading·actions 없음(예: 홈 탭 최상위). */
export const TitleOnly: Story = {
  args: { leading: undefined, onLeadingClick: undefined, title: '마이컬리', actions: undefined },
};

/** 긴 제목 — 말줄임, 액션 아이콘은 항상 보인다. */
export const LongTitle: Story = {
  args: { title: '마이컬리마이컬리마이컬리마이컬리마이컬리마이컬리' },
};

/** 뒤로가기를 링크로 — `leadingHref` 지정 시 `<a>` 로 렌더(`onLeadingClick` 보다 우선). */
export const BackAsLink: Story = {
  args: { leadingHref: '/', onLeadingClick: undefined },
};

// --- 인터랙션 테스트 전용 (autodocs 에서 숨김) ---

/** leading 버튼 클릭 시 `onLeadingClick` 이 호출된다. */
export const LeadingClick: Story = {
  tags: ['!autodocs'],
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: '뒤로 가기' }));
    await expect(args.onLeadingClick).toHaveBeenCalledOnce();
  },
};

/** `leading="close"` 는 "닫기" 라벨의 컨트롤을 렌더한다. */
export const CloseControl: Story = {
  tags: ['!autodocs'],
  args: { leading: 'close', title: '장바구니', actions: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: '닫기' })).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: '뒤로 가기' })).not.toBeInTheDocument();
  },
};

/**
 * 액션은 목적지를 서술하는 접근 가능한 이름을 갖는다(code-style §5).
 * `href` 액션은 링크로, `onClick` 액션은 버튼으로 렌더되고 클릭 시 콜백이 호출된다.
 */
export const ActionLinks: Story = {
  tags: ['!autodocs'],
  args: {
    actions: [...ACTIONS, { icon: 'search', label: '검색', onClick: fn() }],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: '장바구니' })).toHaveAttribute('href', '/cart');
    await expect(canvas.getByRole('link', { name: '배송지 설정' })).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: '알림' })).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: '검색' }));
    const onClickAction = args.actions?.[3];
    const onClick = onClickAction && 'onClick' in onClickAction ? onClickAction.onClick : undefined;
    await expect(onClick).toHaveBeenCalledOnce();
  },
};

/** `center` 에 검색바를 넣으면 헤더 안에서 그대로 렌더된다. */
export const SearchInHeader: Story = {
  tags: ['!autodocs'],
  args: { title: undefined, actions: undefined, center: <SearchBar label="상품 검색" /> },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('searchbox', { name: '상품 검색' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: '뒤로 가기' })).toBeInTheDocument();
    await expect(canvas.queryByRole('navigation')).not.toBeInTheDocument();
  },
};

/** `leadingHref` 가 있으면 leading 이 링크로 렌더된다. */
export const LeadingLinkRenders: Story = {
  tags: ['!autodocs'],
  args: { leadingHref: '/', onLeadingClick: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: '뒤로 가기' })).toHaveAttribute('href', '/');
    await expect(canvas.queryByRole('button', { name: '뒤로 가기' })).not.toBeInTheDocument();
  },
};
