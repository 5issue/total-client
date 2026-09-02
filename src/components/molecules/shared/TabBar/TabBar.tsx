'use client';

import { useRef, type KeyboardEvent } from 'react';

import { TabItem, type TabItemSize, type TabItemTone } from '@/components/atoms/TabItem';

/**
 * TabItem 리스트를 감싸는 컨테이너 (Figma "Tab_Bar" / "Tab_Bar_Ver2").
 * 상태는 갖지 않는 컨트롤드 컴포넌트 — 어떤 탭이 활성인지는 activeId 로 받고,
 * 선택이 바뀌면 onChange 로만 알린다(상태 소유는 부모 organism/page 몫).
 * WAI-ARIA tablist 패턴대로 roving tabIndex + 방향키(← → Home End) 이동을 관리한다
 * (비활성 탭은 건너뜀). 방향키로 포커스가 옮겨가면 즉시 activate(automatic activation).
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
  /** 탭 바 전체에 적용할 active 색. 그룹마다 다르다(상품설명=brand-secondary 등) — TabItem 참고 */
  tone?: TabItemTone;
  /** 탭 바 전체에 적용할 크기. 기본 lg(Heading/M) */
  size?: TabItemSize;
  className?: string;
};

export function TabBar({
  items,
  activeId,
  onChange,
  fitted = false,
  tone,
  size,
  className,
}: TabBarProps) {
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>());
  const enabledIds = items.filter((item) => !item.disabled).map((item) => item.id);

  function focusAndActivate(id: string) {
    buttonRefs.current.get(id)?.focus();
    onChange(id);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentId: string) {
    const currentIndex = enabledIds.indexOf(currentId);
    if (currentIndex === -1 || enabledIds.length === 0) return;

    let nextIndex: number;
    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % enabledIds.length;
        break;
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + enabledIds.length) % enabledIds.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = enabledIds.length - 1;
        break;
      default:
        return;
    }
    const nextId = enabledIds[nextIndex];
    if (!nextId) return;
    event.preventDefault();
    focusAndActivate(nextId);
  }

  return (
    <div
      role="tablist"
      className={`border-border flex border-b ${fitted ? '' : 'overflow-x-auto'} ${className ?? ''}`.trim()}
    >
      {items.map((item) => (
        <TabItem
          key={item.id}
          ref={(el) => {
            if (el) buttonRefs.current.set(item.id, el);
            else buttonRefs.current.delete(item.id);
          }}
          label={item.label}
          active={item.id === activeId}
          disabled={item.disabled}
          tabIndex={item.id === activeId ? 0 : -1}
          tone={tone}
          size={size}
          onClick={() => onChange(item.id)}
          onKeyDown={(event) => handleKeyDown(event, item.id)}
          className={fitted ? 'flex-1 text-center' : undefined}
        />
      ))}
    </div>
  );
}
