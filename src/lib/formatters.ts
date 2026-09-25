/** 가격/날짜 등 표시 포맷 유틸. 필요에 따라 확장한다. */

export const formatPrice = (won: number): string => `${Math.round(won).toLocaleString('ko-KR')}원`;

export const formatDate = (value: string | number | Date): string =>
  new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(new Date(value));

/** 두 날짜의 자정 기준 일수 차 (target - base). My냉장고 유통기한 계산에 쓴다. */
const diffCalendarDays = (target: Date, base: Date): number => {
  const t = new Date(target);
  t.setHours(0, 0, 0, 0);
  const b = new Date(base);
  b.setHours(0, 0, 0, 0);
  return Math.round((t.getTime() - b.getTime()) / 86_400_000);
};

/** 유통기한 D-day 배지(예: "D-2"/"D-day"/"D+4") — 오늘 기준 자정 단위 일수 차. */
export const formatDDayLabel = (expiresAt: string | Date, today: Date = new Date()): string => {
  const diffDays = diffCalendarDays(new Date(expiresAt), today);
  if (diffDays === 0) return 'D-day';
  return diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
};

/** "MM.DD(요일)까지" — My냉장고 카드 만료 표기(Figma 실측, MyFridgeView/mock.ts 참고). */
export const formatExpiryLabel = (expiresAt: string | Date): string => {
  const date = new Date(expiresAt);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const weekday = new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }).format(date);
  return `${mm}.${dd}(${weekday})까지`;
};
