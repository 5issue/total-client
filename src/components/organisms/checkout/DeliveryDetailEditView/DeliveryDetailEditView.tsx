'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { InfoBox } from '@/components/atoms/InfoBox';
import { Input } from '@/components/atoms/Input';
import { Radio, type RadioProps } from '@/components/atoms/Radio';
import { Textarea } from '@/components/atoms/Textarea';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { DeliveryDetailFormSchema, type DeliveryDetailFormFields } from '@/types/deliveryDetail';

/**
 * 체크아웃 '배송 상세정보'의 "수정" 버튼으로 이동하는 화면(organism) — Figma node 666-26216.
 *
 * 체크아웃(#82/#84)이 아직 develop 에 머지되지 않아, 이번 작업은 이 화면 자체(라우트 +
 * 컴포넌트)만 우선 구현한다 — 체크아웃 '수정' 버튼 → 이 라우트 연결은 #84 머지 후 별도 진행
 * (issue #92). 그래서 값은 전부 로컬 상태고, 저장은 아직 상위로 전달할 데도 없어
 * `router.back()` 으로 되돌아가는 것까지만 한다.
 *
 * - 라디오 그룹은 전부 첫 번째 옵션이 기본 선택(사용자 확인, 2026-09-14): 받으실 장소
 *   '문 앞', 기타장소 세부사항 '기타', 메시지 전송 '배송 직후'.
 * - "기타장소 세부사항" 섹션은 '받으실 장소'에서 '기타 장소'를 골랐을 때만 노출된다
 *   (사용자 확인 — Figma 캡처는 개발자 참고용으로 두 섹션을 한 화면에 다 보여줄 뿐,
 *   '문 앞' 선택 시 이 섹션은 보류/숨김이 맞다). '기타'를 고르면 그 안에서 다시
 *   Textarea 가 나온다 — 같은 "선택하면 세부 입력 열림" 패턴이 두 단계로 중첩된 구조.
 * - "받으실 분"은 로그인 사용자 이름으로 채워진 채 시작하지만 "휴대폰"은 비워진 채
 *   시작한다(Figma 그대로 — 비대칭이지만 원본 확인됨).
 * - 필드 라벨(받으실 분 등)은 `Input`/`Textarea` 자체의 `labelVisible`(text-heading-l,
 *   SemiBold) 대신 이 컴포넌트가 직접 그린다 — Figma 라벨 실측이 Medium(500,
 *   text-label-m)이라 `labelVisible`의 SemiBold 와 다르다. `Input`/`Textarea` 자체
 *   `label` 은 접근성용 sr-only 로만 쓴다.
 * - "[필수] 공동현관비밀번호 수집 및 이용 동의"는 별도 체크박스가 없다 — CTA 자체가
 *   "동의하고 저장"이라 그 클릭이 곧 동의다(Figma 문구 그대로). "더보기"는 전문을 펼치는
 *   토글이지만, 이 노드엔 펼친 상태의 실제 약관 전문이 없어 자리표시자로만 둔다(실제
 *   법무 문구는 별도 확정 필요 — 지어내지 않음).
 */
const RECEIVER_NAME_DEFAULT = '이준호';

const OTHER_LOCATION_INFO_ITEMS = [
  '정확한 배송을 위해 장소의 특징 또는 출입 방법 등을 자세하게 작성해주세요.',
  '무인택배함, 보일러실, 양수기 함, 소화전 앞 또는 위탁배송은 불가능합니다.',
  '요청하신 장소로 배송이 어려운 경우, 부득이하게 1층 공동현관 앞에 배송될 수 있습니다.',
  '배송 받으실 시간은 별도로 지정할 수 없습니다.',
] as const;

/** 필드 라벨 한 줄 — 라벨 + 필수 표시(*). Figma "label"(node 666-26221 등) 그대로:
 * text-label-m(14px/500), * 는 brand/primary(#690085, 이 프로젝트 text-primary). */
function FieldLabel({ children }: { children: string }) {
  return (
    <p className="text-label-m text-fg flex items-center">
      {children}
      <span className="text-primary">*</span>
    </p>
  );
}

/** Figma "List_Radio"(node 666-26236 등) — Radio + 라벨을 한 줄로. `Radio` 자체가 이미
 * `<label>` 로 감싸고 있어(누르면 토글되는 44px 터치 타깃) 이 바깥을 또 `<label>` 로
 * 감싸면 라벨이 중첩되는 잘못된 마크업이 된다(체크아웃 "주문자 정보"의 "기본 배송지로
 * 저장" 행과 같은 이유로 `<div>` + 장식용 sr-hidden span 조합을 그대로 따른다 — 라벨
 * 텍스트 자체를 눌러도 토글되지는 않지만 기존 컨벤션과 일관된다). 라디오 자체 44px
 * 터치 타깃이 Figma 32px 래퍼보다 넉넉해 별도 gap 없이도 여백이 충분하다. 라벨 폰트는
 * 필드 라벨과 달리 Regular(400) — text-label-xs. */
function RadioOption({
  className,
  label,
  ...radioProps
}: { label: string; className?: string } & Omit<RadioProps, 'label' | 'variant' | 'tone'>) {
  return (
    <div className={['flex items-center', className].filter(Boolean).join(' ')}>
      <Radio {...radioProps} label={label} tone="purple" />
      <span aria-hidden className="text-label-xs text-fg">
        {label}
      </span>
    </div>
  );
}

export function DeliveryDetailEditView() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<DeliveryDetailFormFields>({
    resolver: zodResolver(DeliveryDetailFormSchema),
    mode: 'onTouched',
    defaultValues: {
      receiverName: RECEIVER_NAME_DEFAULT,
      phone: '',
      location: 'front-door',
      otherLocationType: 'etc',
      otherLocationDetail: '',
      messageTiming: 'immediately',
    },
  });

  const location = useWatch({ control, name: 'location' });
  const otherLocationType = useWatch({ control, name: 'otherLocationType' });
  const messageTiming = useWatch({ control, name: 'messageTiming' });

  function onValid() {
    // 백엔드/상위 상태 없음(#92 범위: 화면만) — 값 확정 후 원래 화면(체크아웃)으로 복귀.
    router.back();
  }

  return (
    <form onSubmit={handleSubmit(onValid)} className="flex min-h-0 flex-1 flex-col">
      <SectionHeader leading="close" onLeadingClick={() => router.back()} title="배송 상세 정보" />

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pt-6 pb-4">
        {/* 받으실 분 */}
        <div className="flex flex-col gap-2">
          <FieldLabel>받으실 분</FieldLabel>
          <Input
            label="받으실 분"
            required
            error={errors.receiverName?.message}
            {...register('receiverName')}
          />
        </div>

        {/* 휴대폰 */}
        <div className="flex flex-col gap-2">
          <FieldLabel>휴대폰</FieldLabel>
          <Input
            label="휴대폰"
            required
            inputMode="tel"
            placeholder="숫자만 입력해주세요"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        {/* 받으실 장소 */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <FieldLabel>받으실 장소</FieldLabel>
            <div className="flex items-center justify-between">
              <RadioOption
                className="w-40"
                name="location"
                value="front-door"
                checked={location === 'front-door'}
                onChange={() => setValue('location', 'front-door', { shouldDirty: true })}
                label="문 앞"
              />
              <RadioOption
                className="w-40"
                name="location"
                value="other"
                checked={location === 'other'}
                onChange={() => setValue('location', 'other', { shouldDirty: true })}
                label="기타 장소"
              />
            </div>
          </div>

          <InfoBox
            variant="inline"
            icon={<Icon name="info-line" size={20} className="text-fg-tertiary" aria-hidden />}
          >
            경비실과 무인택배함 배송이 종료되었어요.
          </InfoBox>
        </div>

        {/* 기타장소 세부사항 — '기타 장소' 선택 시에만. */}
        {location === 'other' ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <FieldLabel>기타장소 세부사항</FieldLabel>

              <RadioOption
                name="otherLocationType"
                value="etc"
                checked={otherLocationType === 'etc'}
                onChange={() => setValue('otherLocationType', 'etc', { shouldDirty: true })}
                label="기타"
              />
              {otherLocationType === 'etc' ? (
                <Textarea
                  label="기타장소 세부사항 자세히"
                  placeholder={
                    '원하시는 장소를 자세히 입력해주세요.\n예 : 계단 밑, 주택단지 앞 경비초소를 지나 A동 출입구'
                  }
                  rows={3}
                  {...register('otherLocationDetail')}
                />
              ) : null}

              <RadioOption
                name="otherLocationType"
                value="locker"
                checked={otherLocationType === 'locker'}
                onChange={() => setValue('otherLocationType', 'locker', { shouldDirty: true })}
                label="택배 수령실"
              />
              <RadioOption
                name="otherLocationType"
                value="entrance"
                checked={otherLocationType === 'entrance'}
                onChange={() => setValue('otherLocationType', 'entrance', { shouldDirty: true })}
                label="공동현관(대문) 앞"
              />
            </div>

            <InfoBox
              variant="callout"
              icon={<Icon name="info-line" size={20} className="text-fg-tertiary" aria-hidden />}
              title="확인해주세요"
            >
              <ul className="list-disc pl-5">
                {OTHER_LOCATION_INFO_ITEMS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </InfoBox>
          </div>
        ) : null}

        {/* 배송 완료 후 메시지 전송 */}
        <div className="flex flex-col gap-2 py-1">
          <FieldLabel>배송 완료 후 메시지 전송</FieldLabel>
          <div className="flex items-center justify-between">
            <RadioOption
              className="w-40"
              name="messageTiming"
              value="immediately"
              checked={messageTiming === 'immediately'}
              onChange={() => setValue('messageTiming', 'immediately', { shouldDirty: true })}
              label="배송 직후"
            />
            <RadioOption
              className="w-40"
              name="messageTiming"
              value="seven-am"
              checked={messageTiming === 'seven-am'}
              onChange={() => setValue('messageTiming', 'seven-am', { shouldDirty: true })}
              label="오전 7시"
            />
          </div>
        </div>

        <hr className="border-border" />

        {/* [필수] 공동현관비밀번호 수집 및 이용 동의 — 별도 체크박스 없음, CTA
            "동의하고 저장" 클릭이 곧 동의(Figma 문구 그대로). "더보기"는 전문이 아직
            없어 자리표시자 토글만 둔다. */}
        <ConsentRow />
      </div>

      <div className="bg-surface shrink-0 px-4 pt-3 pb-11">
        <Button type="submit" variant="primary" size="l" className="h-14 w-full">
          동의하고 저장
        </Button>
      </div>
    </form>
  );
}

function ConsentRow() {
  return (
    <div className="flex items-center justify-between py-1">
      <p className="text-label-l text-fg">[필수] 공동현관비밀번호 수집 및 이용 동의</p>
      {/* 펼친 상태의 실제 약관 전문이 Figma 에 없어 토글만 둔다 — 실제 문구는 법무 확정 후 연결. */}
      <span className="text-label-xs text-fg-tertiary flex items-center gap-1 py-2">
        더보기
        <Icon name="arrow-down" size={20} aria-hidden />
      </span>
    </div>
  );
}
