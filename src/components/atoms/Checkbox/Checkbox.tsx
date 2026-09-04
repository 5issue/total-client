'use client';

import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';

/**
 * 단일 체크박스 (atom). 실제 `<input type="checkbox">` 를 시각적으로만 감싼다 —
 * RHF `register()` 의 `ref` 등 네이티브 동작을 그대로 쓸 수 있다.
 * Figma "5팀 디자인 시스템" — node 2426-1195 "Checkbox" 섹션 중 "Checkbox" 프레임
 * (Outline/Filled × Default/Selected/Disabled).
 *
 * 체크마크는 "Filled/Selected"(2368:430)의 분리된 벡터("Vector 64")를 재사용한다 —
 * `currentColor` 로 그려서 variant 별 색만 바꿔 outline/filled 둘 다에 쓴다.
 * "Outline/Selected"(2332:76)는 테두리+체크가 한 path로 합쳐져 있어 분리 재사용이
 * 불가능해 박스는 CSS(border/bg 토큰)로 별도로 그린다.
 *
 * - outline 테두리는 Default/Selected/Disabled 모두 2px, 기본 색은 `neutral-400`
 *   (Radio Default 와 동일)이고 배경은 기본적으로 투명이다.
 * - outline Selected 테두리색(`#5F0080`)은 Figma에 토큰 바인딩이 없는 raw 값이라
 *   가장 가까운 프로젝트 토큰 `primary`(`#690085`)를 쓴다(디자인 확인 필요).
 * - filled Selected 배경은 `fg`(검정, Radio Black Selected 와 동일), Disabled 배경은
 *   `neutral-400`이고 테두리는 없다.
 * - disabled+checked 조합은 Figma "Disabled" 행에 정의가 없다(unselected만 정의) —
 *   Radio와 동일한 기준으로 합리적으로 확장했다(디자인 확인 필요).
 * - 시각적 라벨 텍스트는 그리지 않는다 — 접근성 이름은 `label`(sr-only)이 담당.
 */
export type CheckboxVariant = 'outline' | 'filled';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  variant?: CheckboxVariant;
  /** `<label htmlFor>` 로 연결되는 접근성 라벨(sr-only). */
  label: string;
}

// 24px 는 Figma 실측 고정값(2426:1195, 벡터 18px + 여백 3px) — 시각 크기는 그대로 두고,
// 44px 터치 타깃은 감싸는 label 쪽에서 확보한다(code-style §5).
const BASE_CLASSNAME =
  'peer size-6 shrink-0 appearance-none rounded-s transition-colors ' +
  'disabled:pointer-events-none ' +
  'focus-visible:outline-border-active outline-offset-2 focus-visible:outline-2 ' +
  'motion-reduce:transition-none';

const VARIANT_CLASSNAME: Record<CheckboxVariant, string> = {
  outline:
    'border-2 border-neutral-400 bg-transparent checked:border-primary ' +
    'disabled:border-neutral-400 disabled:checked:border-neutral-400 disabled:bg-surface-secondary',
  filled:
    'bg-surface-secondary checked:bg-fg ' +
    'disabled:bg-neutral-400 disabled:checked:bg-neutral-400',
};

const VARIANT_TICK_CLASSNAME: Record<CheckboxVariant, string> = {
  outline: 'text-primary',
  filled: 'text-fg-inverse',
};

export function Checkbox({ variant = 'outline', label, id, className, ...props }: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <label
      htmlFor={inputId}
      className={['inline-flex size-11 items-center justify-center', className]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="relative inline-flex">
        <input
          type="checkbox"
          id={inputId}
          className={[BASE_CLASSNAME, VARIANT_CLASSNAME[variant]].join(' ')}
          {...props}
        />
        <svg
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden
          className={[
            'pointer-events-none absolute inset-0 m-auto size-4.5 opacity-0 peer-checked:opacity-100',
            'peer-disabled:text-fg-disabled',
            VARIANT_TICK_CLASSNAME[variant],
          ].join(' ')}
        >
          <path
            d="M4.29297 8.58537L7.51248 11.8049L13.9515 5.36586"
            stroke="currentColor"
            strokeWidth={1.5}
          />
        </svg>
      </span>
      <span className="sr-only">{label}</span>
    </label>
  );
}
