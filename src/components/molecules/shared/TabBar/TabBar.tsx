'use client';

import { useRef, type KeyboardEvent } from 'react';

import { TabItem, type TabItemSize, type TabItemTone } from '@/components/atoms/TabItem';

/**
 * TabItem 리스트를 감싸는 컨테이너 (Figma "Tab_Bar" / "Tab_Bar_Ver2").
 * 상태는 갖지 않는 컨트롤드 컴포넌트 — 어떤 탭이 활성인지는 activeId 로 받고,
 * 선택이 바뀌면 onChange 로만 알린다(상태 소유는 부모 organism/page 몫).
 * WAI-ARIA tablist 패턴대로 roving tabIndex + 방향키(← → Home End) 이동을 관리한다.
 * 방향키로 포커스가 옮겨가면 즉시 activate(automatic activation).
 *
 * 컨테이너는 Figma dev-mode 실측 기준 `padding: 0 8px` 만 갖고 아이템끼리는 gap 없이
 * 바로 붙는다 — Gap/XS(8px)는 프레임 사이 간격이 아니라 각 TabItem 자신의 내부
 * 패딩(프레임↔텍스트)이다. 탭 사이 여백은 각 아이템의 내부 패딩만으로 만들어진다.
 */
export type TabBarItem = {
  id: string;
  label: string;
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
  const ids = items.map((item) => item.id);

  function focusAndActivate(id: string) {
    buttonRefs.current.get(id)?.focus();
    onChange(id);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentId: string) {
    const currentIndex = ids.indexOf(currentId);
    if (currentIndex === -1 || ids.length === 0) return;

    let nextIndex: number;
    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % ids.length;
        break;
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + ids.length) % ids.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = ids.length - 1;
        break;
      default:
        return;
    }
    const nextId = ids[nextIndex];
    if (!nextId) return;
    event.preventDefault();
    focusAndActivate(nextId);
  }

  return (
    <div
      role="tablist"
      className={`border-border flex border-b px-2 ${fitted ? '' : 'overflow-x-auto'} ${className ?? ''}`.trim()}
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
