import type { IconName } from '@/components/atoms/Icon';

/**
 * 마이컬리 홈 화면(node 910-110880 기본 / 698-62968 혜택 알림 바텀시트) 표시 모델.
 * 퍼블리싱 단계라 서버 계약(Zod 스키마)이 아니라 화면용 타입만 둔다. 데이터 연결 시
 * `hooks/user`, `hooks/mypage` 등에서 내려오는 스키마로 교체.
 */
export interface MyKurlySummary {
  nickname: string;
  freeShippingNotice: string;
  points: number;
  kurlyCash: number;
  /** 상품권 보유 여부 — false 면 "상품권 미보유" 배지를 보여준다. */
  hasGiftCard: boolean;
  dailyBenefitPoints: number;
}

export interface QuickMenuEntry {
  id: string;
  icon: IconName;
  label: string;
  /** 있으면 라벨 옆에 숫자를 강조색으로 표시(쿠폰/찜). */
  count?: number;
}

export interface CuratorCardData {
  id: string;
  title: string;
  subtitle: string;
  /** 원(36px) 안에 넣을 글리프. 라이트/다크 공용 — Figma sprite 실측 결과 두 테마 인스턴스가
   * 완전히 같은 이미지(md5 동일)라 아이콘 자체는 테마 무관 고정색이고, 원 배경(`bg-bg`)만
   * 테마에 따라 달라진다. */
  iconSrc: string;
}

export interface KitchenCardData {
  id: string;
  title: string;
  /** 투명 배경 글리프 — 라이트/다크 공용(Figma sprite 실측 md5 동일). 원 배경은 `bg-bg`
   * (`Icon/White_Inverse`, 라이트 흰색/다크 #222222)로 감싸는 쪽에서 테마 처리한다. */
  iconSrc: string;
  /** 글리프 원본 비율(Figma 실측) — 냉장고 22×26, 레시피 32×32 로 서로 다르다. */
  iconWidth: number;
  iconHeight: number;
  /** 없으면 목적지 화면이 아직 없다는 뜻 — 비상호작용으로 렌더한다(`LinkItem` 과 동일 원칙). */
  href?: string;
}

/**
 * `href` 가 없으면 목적지 화면이 아직 없다는 뜻 — 비상호작용으로 렌더한다
 * (`organisms/shared/SectionHeader`의 `pending` 액션과 같은 원칙, structure §6-1).
 */
export interface LinkItem {
  label: string;
  href?: string;
  badge?: 'new';
  subtitle?: string;
}

export interface LinkSectionData {
  /** 없으면 제목 없이 링크 목록만(앱 정보 섹션 — Figma 에 섹션 제목이 없다). */
  title?: string;
  links: LinkItem[];
}
