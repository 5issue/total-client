'use client';

import { useEffect, useId, useRef } from 'react';
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';

import { createPortal } from 'react-dom';

/**
 * 중앙 다이얼로그 (molecule).
 * Figma "5팀 디자인 시스템" — node 2415-5998 "Modal".
 *
 * - `document.body` 에 포털. `role="dialog"` `aria-modal` + 포커스 트랩(Tab 순환) +
 *   열릴 때 포커스 이동·닫힐 때 트리거로 복귀 + `body` 스크롤 잠금 + Esc·백드롭으로 닫기
 *   (각각 `closeOnEscape`/`closeOnBackdrop` 로 개별 차단 가능 — 기본은 둘 다 true).
 * - 상태를 갖지 않는 컨트롤드 — `open` / `onClose` 는 부모 소유.
 * - 액션 버튼은 `footer` 슬롯으로 받는다(Button atom 도입 후 그걸로 채운다).
 *   `footerLayout` 이 Figma Button_Align(가로/세로)에 대응.
 * - `variant="alert"`: Figma "Modal_API"(node 761-106129 등) — 안내 문구 한 줄 + 버튼
 *   1개짜리 짧은 알림형. 기존 확인/취소형(`dialog`, 기본값)과 폭·여백·타이틀 크기가
 *   달라 opt-in 프리셋으로 분리했다(다른 화면에 영향 없음). `description`/`children`/
 *   `footerLayout` 은 이 변형에서 쓰지 않는다 — `title` 이 곧 안내 문구, `footer` 는
 *   보통 버튼 1개를 우측 정렬로 담는다.
 */
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** 제목 아래 본문 텍스트. `variant="alert"` 에서는 사용하지 않는다. */
  description?: string;
  /** description 외 추가 본문(폼 등). `variant="alert"` 에서는 사용하지 않는다. */
  children?: ReactNode;
  /** 하단 액션 버튼 영역. */
  footer?: ReactNode;
  /** footer 배치. row = 가로 균등분할, column = 세로 스택. 기본 row. `alert` 에서는 무시. */
  footerLayout?: 'row' | 'column';
  /** 백드롭 클릭으로 닫기. 기본 true. */
  closeOnBackdrop?: boolean;
  /** Esc 키로 닫기. 기본 true. 주문시간 초과처럼 확인 버튼으로만 닫혀야 하는 모달은 false. */
  closeOnEscape?: boolean;
  /** dialog 카드 레이아웃 전체 override(폭/간격/radius/패딩) — `widthClassName` 과 달리
   *  기본 템플릿과 부분 병합이 아니라 완전히 대체한다(`SectionHeader.titleClassName`과
   *  같은 원칙 — `gap-8`/`rounded-xl` 같은 유틸리티와 새 값이 같은 속성을 겹쳐 쓰면
   *  Tailwind 생성 순서에 따라 뒤엉킨다). 생략하면 기본 템플릿 + `widthClassName` 조합을
   *  쓴다. `alert` 에는 적용하지 않는다. */
  cardClassName?: string;
  /** 백드롭(전체화면 딤 레이어) 전체 override — 같은 원칙으로 완전 대체. 기본값은 기존
   *  소비자 그대로(`bg-overlay` z-50). 헤더·하단 CTA 바를 딤 위로 밝게 띄워야 하는
   *  화면은 그 sticky 요소들의 z-index 보다 낮은 값으로 override. `dialog`/`alert`
   *  둘 다 적용된다. */
  overlayClassName?: string;
  /** 제목 타이포 override. 기본 `text-heading-2 text-fg`. `alert` 에는 적용하지 않는다
   *  (그쪽은 `text-heading-5` 고정). */
  titleClassName?: string;
  /** 설명 타이포 override. 기본 `text-body-s text-fg-secondary`. */
  descriptionClassName?: string;
  /** 제목-설명 묶음의 세로 gap override. 기본 `gap-3`. */
  contentGapClassName?: string;
  /** footer 버튼 사이 gap override. 기본 `gap-2`. */
  footerGapClassName?: string;
  /** 카드에 추가로 얹을 클래스(완전 대체가 아니라 병합) — `alert` 카드, 또는 `dialog` 에서
   *  `cardClassName`/`widthClassName` 위에 소소한 값을 더 얹을 때. */
  className?: string;
  /** 카드 프리셋. 기본 'dialog'(확인/취소형, 폭 320px, 타이틀 Heading/H1). 'alert' 는
   * 위 문서 참고. */
  variant?: 'dialog' | 'alert';
  /** dialog 카드 폭 클래스. 기본 `w-full max-w-xs`(320px, Figma node 2415-5998). 폭이 다른
   *  모달(예: 주문 취소 302px, node 666-28213)은 이 prop 으로 폭만 교체한다 — 나머지
   *  레이아웃(gap/radius/padding)은 기본 템플릿 그대로 두고 싶을 때 `cardClassName`
   *  대신 이걸 쓴다. `cardClassName` 을 명시하면 이 prop 은 무시된다. `alert` 에는
   *  적용하지 않는다. */
  widthClassName?: string;
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let openModalCount = 0;
let bodyOverflowBeforeLock = '';

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  footerLayout = 'row',
  closeOnBackdrop = true,
  closeOnEscape = true,
  cardClassName,
  overlayClassName = 'bg-overlay fixed inset-0 z-50 flex items-center justify-center p-4',
  titleClassName = 'text-heading-2 text-fg',
  descriptionClassName = 'text-body-s text-fg-secondary',
  contentGapClassName = 'gap-3',
  footerGapClassName = 'gap-2',
  className,
  variant = 'dialog',
  widthClassName = 'w-full max-w-xs',
}: ModalProps) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const cardRef = useRef<HTMLDivElement>(null);
  const resolvedCardClassName =
    cardClassName ?? `flex ${widthClassName} flex-col gap-8 rounded-xl px-4 pt-8 pb-4`;

  useEffect(() => {
    if (!open) return;
    const restore = document.activeElement as HTMLElement | null;

    if (openModalCount === 0) {
      bodyOverflowBeforeLock = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    openModalCount += 1;

    const card = cardRef.current;
    const first = card?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? card)?.focus();

    return () => {
      openModalCount -= 1;
      if (openModalCount === 0) document.body.style.overflow = bodyOverflowBeforeLock;
      restore?.focus?.();
    };
  }, [open]);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (closeOnEscape) onClose();
      return;
    }
    if (e.key !== 'Tab' || !cardRef.current) return;

    const items = [...cardRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    const firstEl = items[0];
    const lastEl = items[items.length - 1];
    if (!firstEl || !lastEl) {
      e.preventDefault();
      return;
    }
    if (e.shiftKey && document.activeElement === firstEl) {
      e.preventDefault();
      lastEl.focus();
    } else if (!e.shiftKey && document.activeElement === lastEl) {
      e.preventDefault();
      firstEl.focus();
    }
  }

  function handleBackdrop(e: MouseEvent<HTMLDivElement>) {
    if (closeOnBackdrop && e.target === e.currentTarget) onClose();
  }

  if (!open || typeof document === 'undefined') return null;

  if (variant === 'alert') {
    return createPortal(
      <div className={overlayClassName} onMouseDown={handleBackdrop}>
        <div
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className={[
            'bg-surface flex w-full max-w-[376px] flex-col rounded-xl focus:outline-none',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <p id={titleId} className="text-heading-5 text-fg px-6 py-4">
            {title}
          </p>
          {footer ? <div className="flex items-center justify-end px-2 pb-2">{footer}</div> : null}
        </div>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div className={overlayClassName} onMouseDown={handleBackdrop}>
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={['bg-surface focus:outline-none', resolvedCardClassName, className]
          .filter(Boolean)
          .join(' ')}
      >
        <div className={['flex flex-col', contentGapClassName].filter(Boolean).join(' ')}>
          <h2 id={titleId} className={titleClassName}>
            {title}
          </h2>
          {description ? (
            <p id={descId} className={descriptionClassName}>
              {description}
            </p>
          ) : null}
          {children}
        </div>

        {footer ? (
          <div
            className={
              footerLayout === 'column'
                ? `flex flex-col ${footerGapClassName}`
                : `flex ${footerGapClassName} *:flex-1`
            }
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
