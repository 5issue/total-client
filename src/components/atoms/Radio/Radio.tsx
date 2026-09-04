'use client';

import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';

/**
 * 단일 라디오 버튼 (atom). 실제 `<input type="radio">` 를 시각적으로만 감싼다 —
 * `name`/`value`/RHF `register()` 의 `ref` 등 네이티브 라디오 그룹 동작을 그대로 쓸 수 있다.
 * Figma "5팀 디자인 시스템" — node 2426-1195 "Checkbox" 섹션 중 "Radio" 프레임
 * (Radio_Purple/Radio_Check/Radio_Black × Default/Selected/Disabled).
 *
 * 각 상태를 실제 벡터(path) 단위로 다시 뽑아 렌더링까지 확인해 정정함(이전 두 차례
 * 잘못된 가정이 있었음 — 채움을 selected 때만 흰색으로 바꾼다고 했다가, 그다음엔
 * 상시 회색(#C6C6C6) 채움이 있다고 했었는데, 둘 다 틀렸다):
 * - 채움은 **disabled 일 때만** 존재한다(`surface-secondary`, #F0F5F8). Default/Selected
 *   는 채움이 아예 없다(투명 — 뒤 배경이 그대로 비친다).
 * - 선택 여부는 테두리 **색+굵기**로만 표현한다: Default(얇음, neutral-400) →
 *   Selected(굵음, 톤 색). Disabled 는 ring variant 만 테두리 색이 neutral-500(다른
 *   회색조 — neutral-400 대비 밝기가 아니라 색상만 다름)으로 바뀐다 — check variant 는
 *   disabled 여도 테두리가 default 와 동일(neutral-400, 안 바뀜).
 * - 굵기 실측(9개 노드 SVG 좌표를 직접 다운받아 중심 대비 반지름으로 역산, 2026-09-04
 *   재검증): 아이콘 자체는 28×28 프레임 안에서 지름 23.33px 로 그려진다(프레임에 여백
 *   2.33px 포함 — 28px 는 프레임 크기이지 도형 지름이 아니다). Default/Disabled 링
 *   두께 ≈ 1.73px(지름 대비 7.4%) 는 두 variant 공통. Selected 는 **variant 별로 다르다**
 *   — `ring`(Purple/Black) 은 두 도넛 조각(반지름 5.84→9.33, 9.33→11.67)이 이어붙어
 *   두께 ≈ 5.83px(지름 대비 25%, 거의 1/4)이지만, `check` 는 체크마크가 들어갈 안쪽
 *   구멍을 남겨둬야 해서 바깥쪽 도넛 조각 하나(반지름 9.33→11.67)만 쓰고 두께 ≈
 *   2.33px(지름 대비 10%)로 Default 와 큰 차이가 없다. 28px 박스 기준 Tailwind 굵기
 *   (0/1/2/4/8) 로 매핑하면 Default `border-2`(7.1%, 근접), ring Selected `border-8`
 *   (28.6%, 25%에 근접) 인데, check Selected 는 목표 10%에 `border-2`(7.1%) 가
 *   `border-4`(14.3%) 보다 더 가까워 **check 는 selected 여도 굵기를 바꾸지 않는다**
 *   (대괄호 임의값 금지, code-style §6-1). 처음에 두 variant 를 구분하지 않고
 *   `checked:border-8` 을 공통 베이스에 넣었다가, 두꺼워진 링 안쪽 구멍(28-16=12px)이
 *   체크마크 자체 크기(size-3.5=14px)보다 작아져 체크가 도넛 구멍을 다 가리고 꽉 찬
 *   원처럼 보이는 회귀가 생겨 정정함 — variant 별 별도 클래스로 분리했다.
 * - `variant="check"`: 체크마크는 **모든 상태에서 항상** 그려지고(Default/Disabled 는
 *   테두리와 같은 옅은 색), selected 일 때만 primary 색으로 바뀐다.
 *   check+black 조합은 Figma 예시가 없어(purple만 확인) 타입에서 차단한다(Badge
 *   purple+large 차단과 동일 근거).
 * - 시각적 라벨 텍스트는 컴포넌트가 그리지 않는다(Figma 컴포넌트 자체에 텍스트가 없음) —
 *   접근성 이름은 항상 `label`(sr-only)이 담당하고, 화면에 보이는 라벨은 이 atom을 쓰는
 *   molecule(예: 주소 선택 행)이 별도로 구성한다.
 */
export type RadioTone = 'purple' | 'black';

interface RadioBaseProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** `<label htmlFor>` 로 연결되는 접근성 라벨(sr-only). */
  label: string;
}

export type RadioProps = RadioBaseProps &
  ({ variant?: 'ring'; tone?: RadioTone } | { variant: 'check'; tone?: 'purple' });

const TONE_BORDER_CLASSNAME: Record<RadioTone, string> = {
  purple: 'checked:border-primary',
  black: 'checked:border-fg',
};

const TONE_CHECK_CLASSNAME: Record<RadioTone, string> = {
  purple: 'peer-checked:text-primary',
  black: 'peer-checked:text-fg',
};

// 28px 는 Figma 실측 고정값(2426:1195) — 접근성 권장 44px 터치 타깃에는 못 미치지만
// 검증된 디자인 치수를 임의로 늘리지 않는다(Chip h-10 과 동일한 판단).
const INPUT_BASE =
  'peer size-7 shrink-0 appearance-none rounded-full bg-transparent border-2 border-neutral-400 transition-colors ' +
  'disabled:pointer-events-none disabled:bg-surface-secondary ' +
  'focus-visible:outline-border-active outline-offset-2 focus-visible:outline-2 ' +
  'motion-reduce:transition-none';

// ring variant(Purple/Black) 만 selected 때 두꺼운 도넛(border-8)이 되고, disabled
// 테두리 색도 neutral-500 으로 바뀐다(default 의 neutral-400 보다 밝기가 아니라 색상만
// 다름 — "옅어진다"가 아님, 실측 hex 기준 오히려 더 어둡다).
const RING_VARIANT_CLASSNAME =
  'checked:border-8 disabled:border-neutral-500 disabled:checked:border-neutral-500';

export function Radio({
  variant = 'ring',
  tone = 'purple',
  label,
  id,
  className,
  ...props
}: RadioProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <span className={['relative inline-flex', className].filter(Boolean).join(' ')}>
      <input
        type="radio"
        id={inputId}
        className={[
          INPUT_BASE,
          TONE_BORDER_CLASSNAME[tone],
          variant === 'ring' ? RING_VARIANT_CLASSNAME : '',
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      {variant === 'check' ? (
        <svg
          viewBox="0 0 13.5 10"
          fill="none"
          aria-hidden
          className={[
            'pointer-events-none absolute inset-0 m-auto size-3.5 text-neutral-400',
            TONE_CHECK_CLASSNAME[tone],
          ].join(' ')}
        >
          <path
            d="M1 5.5L4.5 9L12.5 1"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );
}
