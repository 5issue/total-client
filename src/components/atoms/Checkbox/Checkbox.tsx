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
 * - outline 테두리는 Default/Selected/Disabled 모두 2px, 배경은 기본적으로 투명이다.
 *   기본 색은 `tone` 이 정한다 — purple 은 `fg-disabled`(#b5c4cf, Text/Disabled),
 *   black 은 `neutral-400`(#c9d5df, Figma "Icon/Disabled").
 * - outline Selected 는 `tone` 별로 다르다: purple 은 테두리만 브랜드색으로 바뀌고
 *   (Figma raw `#5F0080` → 가장 가까운 토큰 `primary` #690085, 디자인 확인 필요),
 *   black 은 Radio Black 과 같은 검정 채움 + 흰 체크가 된다.
 * - filled Selected 배경은 `fg`(검정, Radio Black Selected 와 동일), Disabled 배경은
 *   `neutral-400`이고 테두리는 없다.
 * - disabled+checked 조합은 Figma "Disabled" 행에 정의가 없다(unselected만 정의) —
 *   Radio와 동일한 기준으로 합리적으로 확장했다(디자인 확인 필요).
 * - 시각적 라벨 텍스트는 그리지 않는다 — 접근성 이름은 `label`(sr-only)이 담당.
 * - `size` 는 **프레임 크기**다(박스 자체가 아니다). Figma 컴포넌트는 박스 둘레에 3px
 *   여백을 두른 프레임이라 18 → 박스 18/프레임 24, 28("checkbox 28") → 박스 22/프레임 28
 *   이다(node 968-111162 실측 22×22). 44px 터치 타깃은 두 사이즈 모두 동일.
 */
export type CheckboxVariant = 'outline' | 'filled';
export type CheckboxSize = 18 | 28;
/** outline Selected 색 계열. Radio 의 `tone` 과 같은 개념(purple = 브랜드, black = 검정 채움). */
export type CheckboxTone = 'purple' | 'black';

interface CheckboxBaseProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  size?: CheckboxSize;
  /** `<label htmlFor>` 로 연결되는 접근성 라벨(sr-only). */
  label: string;
}

/** `tone` 은 outline 전용 — filled 는 Selected 색이 검정 하나뿐이라 타입에서 막는다. */
export type CheckboxProps = CheckboxBaseProps &
  ({ variant?: 'outline'; tone?: CheckboxTone } | { variant: 'filled'; tone?: never });

// 44px 터치 타깃은 감싸는 label(`size-11`)이 확보한다(code-style §5).
const BASE_CLASSNAME =
  'peer shrink-0 appearance-none rounded-sm transition-colors ' +
  'disabled:pointer-events-none ' +
  'focus-visible:outline-border-active outline-offset-2 focus-visible:outline-2 ' +
  'motion-reduce:transition-none';

// 박스 자체 크기 — `size`(프레임)보다 3px씩 작다. 위 주석 참고.
const SIZE_CLASSNAME: Record<CheckboxSize, string> = {
  18: 'size-4.5',
  28: 'size-5.5',
};

const VARIANT_CLASSNAME: Record<CheckboxVariant, string> = {
  outline:
    'border-2 bg-transparent ' +
    'disabled:border-fg-disabled disabled:checked:border-fg-disabled disabled:bg-surface-secondary',
  filled:
    'bg-surface-secondary checked:bg-fg ' +
    'disabled:bg-neutral-400 disabled:checked:bg-neutral-400',
};

const OUTLINE_TONE_CLASSNAME: Record<CheckboxTone, string> = {
  purple: 'border-fg-disabled checked:border-primary',
  black: 'border-neutral-400 checked:border-fg checked:bg-fg disabled:checked:bg-fg-disabled',
};

const OUTLINE_TICK_CLASSNAME: Record<CheckboxTone, string> = {
  purple: 'text-primary',
  black: 'text-fg-inverse',
};

export function Checkbox({
  variant = 'outline',
  tone = 'purple',
  size = 18,
  label,
  id,
  className,
  ...props
}: CheckboxProps) {
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
          className={[
            BASE_CLASSNAME,
            SIZE_CLASSNAME[size],
            VARIANT_CLASSNAME[variant],
            variant === 'outline' ? OUTLINE_TONE_CLASSNAME[tone] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        <svg
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden
          className={[
            'pointer-events-none absolute inset-0 m-auto opacity-0 peer-checked:opacity-100',
            SIZE_CLASSNAME[size],
            'peer-disabled:text-fg-disabled',
            variant === 'filled' ? 'text-fg-inverse' : OUTLINE_TICK_CLASSNAME[tone],
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
