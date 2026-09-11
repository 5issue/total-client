import { Icon, type IconName } from '@/components/atoms/Icon';

/**
 * 장바구니 카드 안의 온도대 구분 헤더 (molecule).
 * Figma "5팀 UI 공유용" — `Frame 1430106803` (아이콘 20 + 라벨).
 * 표시 전용(RSC). 아이템 목록은 상위(CartCard)가 이 헤더 아래에 조립한다.
 */
export type CartTemperature = 'refrigerated' | 'frozen';

export interface CartTemperatureSectionHeaderProps {
  temperature: CartTemperature;
  className?: string;
}

const CONFIG: Record<CartTemperature, { icon: IconName; label: string }> = {
  refrigerated: { icon: 'refrigerated', label: '냉장상품' },
  frozen: { icon: 'frozen', label: '냉동상품' },
};

export function CartTemperatureSectionHeader({
  temperature,
  className,
}: CartTemperatureSectionHeaderProps) {
  const { icon, label } = CONFIG[temperature];
  return (
    <div className={['flex items-center gap-1', className].filter(Boolean).join(' ')}>
      <Icon name={icon} size={20} aria-hidden />
      <span className="text-heading-4 text-fg">{label}</span>
    </div>
  );
}
