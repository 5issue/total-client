import { TabItem } from '@/components/atoms/TabItem';

/**
 * TabItem 리스트를 감싸는 컨테이너 (Figma "Tab_Bar" / "Tab_Bar_Ver2").
 * 상태는 갖지 않는 컨트롤드 컴포넌트 — 어떤 탭이 활성인지는 activeId 로 받고,
 * 선택이 바뀌면 onChange 로만 알린다(상태 소유는 부모 organism/page 몫).
 * 상호작용은 자식 TabItem(“use client”)이 담당하므로 이 컴포넌트 자체엔 client 경계가 필요 없다.
 */
export type TabBarItem = {
  id: string;
  label: string;
  disabled?: boolean;
};

export type TabBarProps = {
  items: TabBarItem[];
  activeId: string;
  onChange: (id: string) => void;
  /** true면 아이템이 컨테이너 폭을 균등 분할(Tab_Bar_Ver2, 보통 2개).
   *  기본값(false)은 아이템이 자연폭을 유지하고 넘치면 가로 스크롤(Tab_Bar). */
  fitted?: boolean;
  className?: string;
};

export function TabBar({ items, activeId, onChange, fitted = false, className }: TabBarProps) {
  return (
    <div
      role="tablist"
      className={`border-border flex border-b ${fitted ? '' : 'overflow-x-auto'} ${className ?? ''}`.trim()}
    >
      {items.map((item) => (
        <TabItem
          key={item.id}
          label={item.label}
          active={item.id === activeId}
          disabled={item.disabled}
          onClick={() => onChange(item.id)}
          className={fitted ? 'flex-1 text-center' : undefined}
        />
      ))}
    </div>
  );
}
