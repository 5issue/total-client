'use client';

import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';

/**
 * 단일 라디오 버튼 (atom). 실제 `<input type="radio">` 를 시각적으로만 감싼다 —
 * `name`/`value`/RHF `register()` 의 `ref` 등 네이티브 라디오 그룹 동작을 그대로 쓸 수 있다.
 * Figma "5팀 디자인 시스템" — node 2426-1195 "Checkbox" 섹션 중 "Radio" 프레임
 * (Radio_Purple/Radio_Check/Radio_Black × Default/Selected/Disabled).
 *
 * - 글리프 크기·채움은 `tone` 이 정한다(`TONE_CLASSNAME` 주석 참고) — purple 은 28px +
 *   미선택 투명, black 은 22px + `surface-secondary` 채움. purple 의 채움은 여전히
 *   disabled 일 때만 생긴다.
 * - 선택 여부는 테두리 색+굵기로 표현한다: Default(얇음, fg-disabled) → Selected(굵음,
 *   톤 색). Disabled는 ring variant만 테두리 색이 neutral-500으로 바뀐다(check는
 *   Default와 동일하게 유지).
 * - 굵기는 variant별로 다르다: ring 은 Figma 실측 두께 비율(지름 대비 약 25%)에 맞춰
 *   selected 시 도넛이 되고(글리프가 큰 purple 은 `border-8`, 22px 인 black 은
 *   `border-6`), check 는 안쪽에 체크마크가 들어갈 자리를 남겨둬야 해서 두께 차이가
 *   작고(10%) selected여도 `border-2`를 그대로 유지한다(대괄호 임의값 금지,
 *   code-style §6-1).
 * - check variant의 체크마크는 모든 상태에서 항상 그려지고(비선택 시 테두리와 같은
 *   옅은 색), selected일 때만 톤 색으로 바뀐다. check+black 조합은 Figma 예시가 없어
 *   타입에서 차단한다.
 * - 시각적 라벨 텍스트는 그리지 않는다 — 접근성 이름은 `label`(sr-only)이 담당하고,
 *   화면 라벨은 이 atom을 쓰는 molecule이 구성한다.
 */
export type RadioTone = 'purple' | 'black';

interface RadioBaseProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** `<label htmlFor>` 로 연결되는 접근성 라벨(sr-only). */
  label: string;
}

export type RadioProps = RadioBaseProps &
  ({ variant?: 'ring'; tone?: RadioTone } | { variant: 'check'; tone?: 'purple' });

/**
 * 톤별 글리프 크기·채움·선택색.
 *
 * `black`(Figma "Radio_Black", 검색 필터 가격 탭 전용)은 내보낸 SVG 에셋 실측 그대로다 —
 * 28px 프레임 안 **22px 글리프**(`<circle r="11" fill="#F0F5F8">` + 링 `fill="#B5C4CF"`).
 * 즉 링은 `fg-disabled`, 안쪽은 `surface-secondary` 로 차 있고 프레임을 꽉 채우지 않는다
 * — Checkbox 의 "28 = 프레임, 글리프는 22" 규칙과 같다.
 *
 * `purple`(Radio_Purple, 배송지 화면)은 디자인 시스템 컴포넌트 세트 기준 그대로 —
 * 28px 글리프 + 미선택 투명(채움은 disabled 일 때만).
 */
const TONE_CLASSNAME: Record<RadioTone, string> = {
  purple: 'size-7 bg-transparent checked:border-primary',
  black: 'size-5.5 bg-surface-secondary checked:border-fg',
};

/** ring 도넛 두께 — 지름 대비 약 25%(Radio 문서 주석). 글리프 크기가 톤마다 달라 같이 간다. */
const RING_THICKNESS_CLASSNAME: Record<RadioTone, string> = {
  purple: 'checked:border-8',
  black: 'checked:border-6',
};

const TONE_CHECK_CLASSNAME: Record<RadioTone, string> = {
  purple: 'peer-checked:text-primary',
  black: 'peer-checked:text-fg',
};

// 글리프 크기는 톤별(`TONE_CLASSNAME`) — 44px 터치 타깃은 감싸는 label 이 확보한다
// (code-style §5). 미선택 테두리 `fg-disabled`(#b5c4cf)는 Figma SVG 에셋의 링 색이다.
const INPUT_BASE =
  'peer shrink-0 appearance-none rounded-full border-2 border-fg-disabled transition-colors ' +
  'disabled:pointer-events-none disabled:bg-surface-secondary ' +
  'focus-visible:outline-border-active outline-offset-2 focus-visible:outline-2 ' +
  'motion-reduce:transition-none';

// ring variant 만 selected 때 두꺼운 도넛이 되고(두께는 `RING_THICKNESS_CLASSNAME`),
// disabled 테두리 색도 neutral-500 으로 바뀐다.
const RING_VARIANT_CLASSNAME = 'disabled:border-neutral-500 disabled:checked:border-neutral-500';

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
    <label
      htmlFor={inputId}
      className={['inline-flex size-11 items-center justify-center', className]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="relative inline-flex">
        <input
          type="radio"
          id={inputId}
          className={[
            INPUT_BASE,
            TONE_CLASSNAME[tone],
            variant === 'ring' ? `${RING_VARIANT_CLASSNAME} ${RING_THICKNESS_CLASSNAME[tone]}` : '',
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
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
      <span className="sr-only">{label}</span>
    </label>
  );
}
