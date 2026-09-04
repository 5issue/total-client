'use client';

import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';

/**
 * 단일 체크박스 (atom). 실제 `<input type="checkbox">` 를 시각적으로만 감싼다 —
 * RHF `register()` 의 `ref` 등 네이티브 동작을 그대로 쓸 수 있다.
 * Figma "5팀 디자인 시스템" — node 2426-1195 "Checkbox" 섹션 중 "Checkbox" 프레임
 * (Outline/Filled × Default/Selected/Disabled).
 *
 * 체크마크는 "Filled/Selected"(2368:430) 노드에서 박스(Rectangle)와 분리된
 * 별도 벡터("Vector 64")로 확인돼 그대로 재사용했다 — `currentColor` 로 그려서
 * variant 별 색만 바꿔 outline/filled 둘 다에 쓴다. "Outline/Selected"(2332:76)는
 * 테두리+체크가 한 path로 합쳐져 있어 그쪽에서는 분리 재사용이 불가능했다.
 * 박스 자체는 CSS(border/bg 토큰)로 그린다.
 *
 * 6개 노드 SVG 좌표·바인딩된 Figma 변수명을 직접 대조해 재검증함(2026-09-04):
 * - `outline` 테두리는 Default/Selected/Disabled 전부 굵기 ≈2px(0.025~0.3px 오차는
 *   Figma 불리언 연산 잔여물) — `border-2` 를 상시 적용해야 하는데 기존엔 base 가
 *   `border`(1px)라 Default 만 더 얇았다. 색도 Default/Disabled 는 `Icon/Disabled`
 *   (neutral-400, Radio Default 와 동일)인데 기존엔 `border-border`(neutral-300,
 *   더 옅음)를 썼다. 배경도 Default/Selected 는 Figma 에 채움 레이어 자체가 없어
 *   완전 투명인데 기존엔 `bg-surface`(불투명 흰색)였다 — 전부 수정.
 * - `outline` Selected 테두리(+체크)는 raw `#5F0080`, Figma 변수 바인딩이 없다(토큰
 *   미지정 상태로 보임). 프로젝트 팔레트에서 가장 가까운 건 `brand-500`(`#690085`,
 *   primary) 이라 그대로 유지 — 정확히 일치하는 토큰은 없어 디자인 쪽 확인 필요.
 * - `filled` Selected 배경은 `Icon/Black_Inverse`(`#222222` = `fg` 토큰, Radio Black
 *   Selected 와 동일한 검정)다. 기존엔 `checked:bg-primary`(보라)였는데 이건 틀림 —
 *   `checked:bg-fg` 로 수정.
 * - `filled` Disabled 배경은 `Icon/Disabled`(neutral-400, `#C9D5DF`)이고 테두리가
 *   아예 없다. 기존엔 base 의 `disabled:border disabled:bg-surface-secondary` 를
 *   variant 구분 없이 그대로 받아써서 색도 틀리고(surface-secondary, #F0F5F8) 없어야
 *   할 테두리까지 생겼다 — variant 별로 분리.
 * - disabled+checked 조합은 Figma "Disabled" 행에 없다(unselected만 정의) — Radio와
 *   동일하게 합리적으로 확장했다(outline: neutral-400 테두리 유지, filled:
 *   neutral-400 배경 유지). 디자인 확인 필요.
 * - 시각적 라벨 텍스트는 컴포넌트가 그리지 않는다 — 접근성 이름은 `label`(sr-only)이 담당.
 */
export type CheckboxVariant = 'outline' | 'filled';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  variant?: CheckboxVariant;
  /** `<label htmlFor>` 로 연결되는 접근성 라벨(sr-only). */
  label: string;
}

// 24px 는 Figma 실측 고정값(2426:1195, 벡터 18px + 여백 3px) — 접근성 권장 44px 터치
// 타깃에는 못 미치지만 검증된 디자인 치수를 임의로 늘리지 않는다.
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
    <span className={['relative inline-flex', className].filter(Boolean).join(' ')}>
      <input
        type="checkbox"
        id={inputId}
        className={[BASE_CLASSNAME, VARIANT_CLASSNAME[variant]].join(' ')}
        {...props}
      />
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
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
  );
}
