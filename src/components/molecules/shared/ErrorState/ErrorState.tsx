import type { ReactNode } from 'react';

/**
 * 아이콘 + 안내 문구 + 액션 버튼으로 구성된 에러·빈 상태 (molecule).
 * Figma "5팀 디자인 시스템" — node 2657-3838 "Error" 섹션(`Error`/`Error_API` 상태).
 *
 * - `icon`/`action`은 타입을 모르는 순수 슬롯 — 소비자가 `Icon`/`FloatingButton` atom 을
 *   직접 조립해 넘긴다. 두 Figma 상태 모두 액션 버튼이 기존 `FloatingButton` 과 스타일이
 *   정확히 일치해 재사용한다.
 * - `description` 유무로 `title` 톤이 갈린다 — 빈 상태(`Error`)는 설명 없이 조용한 안내
 *   한 줄(`text-heading-5 text-fg-quaternary`)이고, 에러 상세(`Error_API`)는 굵은
 *   헤드라인(`text-heading-1 text-fg`) + 회색 설명이다. Figma 원본 그대로 반영.
 * - `children`은 설명과 액션 사이의 추가 콘텐츠 슬롯. `Error_API`의 주문정보 박스처럼
 *   도메인 특화 내용은 이 컴포넌트 책임이 아니라 소비자가 조립한다(Card 의
 *   title/subtitle과 동일 원칙).
 * - 상태를 갖지 않는다(RSC 유지) — `action`에 담긴 핸들러는 소비자 책임.
 * - 동적으로 나타나는 안내이므로 `role="status"`(Toast 와 동일 패턴, code-style §5).
 */
export interface ErrorStateProps {
  /** 장식용 아이콘/일러스트. 접근 가능한 이름은 `title` 이 담당하므로 `aria-hidden` 권장. */
  icon: ReactNode;
  title: string;
  description?: string;
  /** 설명과 액션 사이에 넣을 추가 콘텐츠(예: 주문정보 박스). */
  children?: ReactNode;
  /** 재시도 등 액션. 보통 `FloatingButton`. */
  action?: ReactNode;
  className?: string;
}

export function ErrorState({
  icon,
  title,
  description,
  children,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="status"
      className={['flex w-full flex-col items-center gap-5', className].filter(Boolean).join(' ')}
    >
      <div className="flex w-full flex-col items-center gap-3">
        {icon}
        <div className="flex flex-col items-center gap-1 text-center">
          <p
            className={description ? 'text-heading-1 text-fg' : 'text-heading-5 text-fg-quaternary'}
          >
            {title}
          </p>
          {description ? <p className="text-body-s text-fg-secondary">{description}</p> : null}
        </div>
      </div>
      {children}
      {action}
    </div>
  );
}
