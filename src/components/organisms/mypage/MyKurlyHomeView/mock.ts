import type {
  CuratorCardData,
  KitchenCardData,
  LinkSectionData,
  MyKurlySummary,
  QuickMenuEntry,
} from './model';

/**
 * 마이컬리 홈 스텁 데이터 (퍼블리싱 단계). BE `hooks/user`·`hooks/mypage` 연동 전이라
 * 화면 값은 전부 여기서 온다 — Figma node 910-110880 실측 그대로(적립금·쿠폰·찜 등
 * 수치도 디자인 목업 값을 그대로 옮긴 것, 실제 0/1 의미가 아니다).
 */
export const MOCK_SUMMARY: MyKurlySummary = {
  nickname: '박서연',
  freeShippingNotice: '최소 1회 무료배송',
  points: 0,
  kurlyCash: 0,
  hasGiftCard: false,
  dailyBenefitPoints: 0,
};

export const MOCK_QUICK_MENU: QuickMenuEntry[] = [
  { id: 'orders', icon: 'receipt', label: '주문내역' },
  { id: 'fresh-subscription', icon: 'milk', label: '신선구독' },
  { id: 'coupons', icon: 'coupon', label: '쿠폰', count: 0 },
  { id: 'wishlist', icon: 'heart', label: '찜', count: 1 },
  { id: 'reviews', icon: 'review', label: '후기' },
];

export const MOCK_KITCHEN_CARDS: KitchenCardData[] = [
  {
    id: 'fridge',
    title: 'MY 냉장고',
    iconSrc: '/mypage/kitchen-fridge.png',
    iconWidth: 22,
    iconHeight: 26,
  },
  {
    id: 'recipe',
    title: 'MY 레시피',
    iconSrc: '/mypage/kitchen-recipe.png',
    iconWidth: 32,
    iconHeight: 32,
  },
];

export const MOCK_CURATOR_CARDS: CuratorCardData[] = [
  {
    id: 'curator',
    title: '컬리 큐레이터',
    subtitle: '시작하기',
    iconSrc: '/mypage/curator-event.png',
  },
  {
    id: 'reward',
    title: '내 리워드',
    subtitle: '수익 확인하기',
    iconSrc: '/mypage/curator-point.png',
  },
  {
    id: 'guide',
    title: '활동 가이드',
    subtitle: '혜택 확인하기',
    iconSrc: '/mypage/curator-attendance.png',
  },
];

/** 링크 대다수는 목적지 화면이 아직 없어 `href` 를 비워 비상호작용으로 둔다(model.ts 참고). */
export const MOCK_LINK_SECTIONS: LinkSectionData[] = [
  {
    title: '쇼핑',
    links: [
      { label: '결제수단·컬리페이' },
      { label: '자주 산 상품' },
      { label: '취소·반품·교환 내역' },
      { label: '선물내역' },
    ],
  },
  {
    title: '혜택',
    links: [
      { label: '친구초대', badge: 'new', subtitle: '친구 찾고 5천원 받기' },
      { label: '컬리멤버스', subtitle: '인기 쿠폰 바로 받기' },
    ],
  },
  {
    title: '내 정보관리',
    links: [
      { label: '회원 정보 관리', href: '/mypage/profile' },
      { label: '나의 컬리 스타일' },
      { label: '배송지 관리', href: '/mypage/addresses' },
      { label: 'VIP 예상 등급' },
    ],
  },
  {
    title: '서비스 안내',
    links: [{ label: '배송안내' }, { label: '컬리 퍼플 박스' }, { label: 'VIP 제도 안내' }],
  },
  {
    title: '고객 지원',
    links: [
      { label: '고객 센터' },
      { label: '공지 사항' },
      { label: '상품 문의' },
      { label: '자주하는 질문' },
      { label: '1:1 문의' },
      { label: '대량 주문 문의' },
      { label: '리서치 참여하기' },
    ],
  },
  {
    title: '법적정보 및 기타',
    links: [{ label: '개인정보처리방침' }],
  },
  {
    // Figma 에 섹션 제목이 없다(App Info Section, node 910-110960) — 앱 버전 카드는
    // ShoppingLinksSection 이 `leadingCard` 로 직접 끼워 넣는다.
    links: [{ label: '오픈소스' }],
  },
  {
    title: '계정',
    links: [{ label: '로그아웃' }, { label: '회원 탈퇴' }],
  },
];

export const MOCK_APP_VERSION = { version: '3.80.0', label: '최신버전' } as const;
