'use client';

import { useRef, useState } from 'react';
import type { FormEvent } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { InfoBox } from '@/components/atoms/InfoBox';
import { Input } from '@/components/atoms/Input';
import { Radio, type RadioProps } from '@/components/atoms/Radio';
import { Textarea } from '@/components/atoms/Textarea';
import { Modal } from '@/components/molecules/shared/Modal';
import { SectionHeader } from '@/components/organisms/shared/SectionHeader';
import { useDeliveryDetailStore } from '@/hooks/useDeliveryDetailStore';
import { PHONE_DIGITS_REGEX } from '@/types/address';
import { DeliveryDetailFormSchema, type DeliveryDetailFormFields } from '@/types/deliveryDetail';

/**
 * 체크아웃 '배송 상세정보'의 "수정" 버튼으로 이동하는 화면(organism) — Figma node 666-26216
 * (기본 상태), 666-26389("택배 수령실" 선택 상태), 666-26457("공동현관(대문) 앞" 선택 상태),
 * '문 앞' 공동현관 출입방법(1315-107775 비밀번호 / 1331-53140 자유출입 / 1331-53415 경비실
 * 호출 / 1331-53560 기타).
 *
 * "동의하고 저장" 은 `deliveryDetailStore` 에 확정값을 넣은 뒤 `router.back()` 으로
 * 주문서에 돌아간다. 서버 API 가 아니라 세션 한정 클라 상태다.
 *
 * - 라디오 그룹은 전부 첫 번째 옵션이 기본 선택(사용자 확인, 2026-09-14): 받으실 장소
 *   '문 앞', 기타장소 세부사항 '기타', 메시지 전송 '배송 직후'.
 * - "공동현관 출입방법" 섹션은 '문 앞'일 때만 노출된다(node 1315-107775). 기본 선택은
 *   '공동현관 비밀번호'이고, 그 아래 한 줄 Input 이 열린다. '자유출입 가능'은 추가 입력
 *   없음(node 1331-53140). '경비실 호출'/'기타'는 옵션 아래 Textarea 가 열린다(예시만
 *   다름). 비밀번호·경비실·기타 입력은 별 필드라 라디오를 오가도 값이 섞이지 않는다.
 * - "기타장소 세부사항" 섹션은 '받으실 장소'에서 '기타 장소'를 골랐을 때만 노출된다
 *   (사용자 확인 — Figma 캡처는 개발자 참고용으로 두 섹션을 한 화면에 다 보여줄 뿐,
 *   '문 앞' 선택 시 이 섹션은 보류/숨김이 맞다). 그 안에서 '기타' 또는 '택배 수령실'을
 *   고르면 선택한 옵션 바로 아래에 Textarea 가 열린다(예시 문구만 다름, node 666-26389
 *   확인) — 같은 "선택하면 세부 입력 열림" 패턴이 두 단계로 중첩된 구조. '공동현관(대문)
 *   앞'은 세부 입력이 없다(node 666-26457 확인). 두 Textarea 는 서로 다른 필드
 *   (`etcLocationDetail`/`lockerLocationDetail`)라 라디오를 오가도 값이 섞이지 않는다
 *   (사용자 확인 — 처음엔 하나의 필드를 공유해 값이 새는 실버그였다, 2026-09-14).
 * - "받으실 분"은 로그인 사용자 이름으로 채워진 채 시작하지만 "휴대폰"은 비워진 채
 *   시작한다(Figma 그대로 — 비대칭이지만 원본 확인됨).
 * - 필드 라벨(받으실 분 등)은 `Input`/`Textarea` 자체의 `labelVisible`(text-heading-l,
 *   SemiBold) 대신 이 컴포넌트가 직접 그린다 — Figma 라벨 실측이 Medium(500,
 *   text-label-m)이라 `labelVisible`의 SemiBold 와 다르다. `Input`/`Textarea` 자체
 *   `label` 은 접근성용 sr-only 로만 쓴다.
 * - "[필수] 공동현관비밀번호 수집 및 이용 동의"는 별도 체크박스가 없다 — CTA 자체가
 *   "동의하고 저장"이라 그 클릭이 곧 동의다(Figma 문구 그대로). "더보기"는 약관 전문이
 *   Figma 에 없어 동작 없는 컨트롤로 두지 않는다(법무 문구 확정 후 연결).
 * - 필수값 미입력 시 인라인 에러가 아니라 알림 모달로 안내한다(node 761-106060 휴대폰,
 *   761-106130 기타장소, 761-106200 택배 수령실 — `Modal` `variant="alert"`). 모달
 *   "확인"을 누르면 해당 섹션으로 스크롤 이동 + 포커스한다(사용자 확인, 2026-09-14).
 *   "받으실 분"과 휴대폰의 "형식 오류"(예: 자릿수 부족)는 기존처럼 `Input` 하단 인라인
 *   에러 그대로 — 이 모달은 오직 "완전히 비어 있음" 케이스만 가로챈다.
 */
const RECEIVER_NAME_DEFAULT = '이준호';

const OTHER_LOCATION_INFO_ITEMS = [
  '정확한 배송을 위해 장소의 특징 또는 출입 방법 등을 자세하게 작성해주세요.',
  '무인택배함, 보일러실, 양수기 함, 소화전 앞 또는 위탁배송은 불가능합니다.',
  '요청하신 장소로 배송이 어려운 경우, 부득이하게 1층 공동현관 앞에 배송될 수 있습니다.',
  '배송 받으실 시간은 별도로 지정할 수 없습니다.',
] as const;

/** "기타장소 세부사항"에서 '기타'/'택배 수령실' 선택 시 여는 Textarea 의 placeholder
 * (node 666-26389 "택배 수령실" 선택 상태 확인) — 예시 문구만 다르다. '공동현관(대문)
 * 앞'은 세부 입력이 없다(node 666-26457 확인 — 선택해도 아무 것도 열리지 않는다). */
const ETC_LOCATION_DETAIL_PLACEHOLDER =
  '원하시는 장소를 자세히 입력해주세요.\n예 : 계단 밑, 주택단지 앞 경비초소를 지나 A동 출입구';
const LOCKER_LOCATION_DETAIL_PLACEHOLDER =
  '원하시는 장소를 자세히 입력해주세요.\n예 : 1층 출입구 오른쪽 택배수령실에 배송해주세요.';

/** '문 앞' > 공동현관 출입방법 — node 1315-107775 / 1331-53415 / 1331-53560. */
const FRONT_DOOR_PASSWORD_PLACEHOLDER = '출입에 필요한 버튼을 모두 입력해주세요.';
const FRONT_DOOR_SECURITY_PLACEHOLDER =
  '경비실 호출 방법을 자세히 입력해주세요.\n예: 공동현관에서 경비실 모양 버튼';
const FRONT_DOOR_ETC_PLACEHOLDER = '출입 방법을 상세히 기재해주세요.';
const FRONT_DOOR_ACCESS_INFO =
  '비밀번호가 정확하지 않을 경우, 부득이하게 1층 공동현관 앞에 배송될 수 있습니다.';

/** 필수값 미입력 알림 모달 문구 — node 761-106060(휴대폰), 761-106130(기타), 761-106200
 * (택배 수령실). '기타장소 세부사항' 은 어떤 옵션이 선택돼 있었는지에 따라 문구가 갈린다. */
const OTHER_LOCATION_DETAIL_REQUIRED_MESSAGE: Partial<
  Record<DeliveryDetailFormFields['otherLocationType'] & string, string>
> = {
  etc: '기타 장소 세부 사항 내용을 입력해주세요.',
  locker: '택배 수령실 위치를 자세히 입력해주세요.',
};
const PHONE_REQUIRED_MESSAGE = '휴대폰 번호를 입력해주세요.';
const FRONT_DOOR_ACCESS_REQUIRED_MESSAGE: Record<
  Exclude<DeliveryDetailFormFields['frontDoorAccessType'], 'free'>,
  string
> = {
  password: '공동현관 비밀번호를 입력해주세요.',
  security: '경비실 호출 방법을 입력해주세요.',
  etc: '출입 방법을 입력해주세요.',
};

type ValidationModalKind = 'phone' | 'otherLocationDetail' | 'frontDoorAccess';

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

const EMPTY_FORM_VALUES: DeliveryDetailFormFields = {
  receiverName: RECEIVER_NAME_DEFAULT,
  phone: '',
  location: 'front-door',
  otherLocationType: 'etc',
  etcLocationDetail: '',
  lockerLocationDetail: '',
  frontDoorAccessType: 'password',
  frontDoorPassword: '',
  frontDoorSecurityDetail: '',
  frontDoorEtcDetail: '',
  messageTiming: 'immediately',
};

export function DeliveryDetailEditView() {
  const router = useRouter();
  const savedDetail = useDeliveryDetailStore((s) => s.detail);
  const setDetail = useDeliveryDetailStore((s) => s.setDetail);

  const {
    register,
    handleSubmit,
    getValues,
    control,
    setValue,
    formState: { errors },
  } = useForm<DeliveryDetailFormFields>({
    resolver: zodResolver(DeliveryDetailFormSchema),
    mode: 'onTouched',
    defaultValues: savedDetail ?? EMPTY_FORM_VALUES,
  });

  const location = useWatch({ control, name: 'location' });
  const otherLocationType = useWatch({ control, name: 'otherLocationType' });
  const frontDoorAccessType = useWatch({ control, name: 'frontDoorAccessType' });
  const messageTiming = useWatch({ control, name: 'messageTiming' });

  // register() 의 ref 와 스크롤+포커스용 ref 를 합친다(모달 "확인" 클릭 시 사용).
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const phoneField = register('phone');
  const etcLocationDetailRef = useRef<HTMLTextAreaElement | null>(null);
  const etcLocationDetailField = register('etcLocationDetail');
  const lockerLocationDetailRef = useRef<HTMLTextAreaElement | null>(null);
  const lockerLocationDetailField = register('lockerLocationDetail');
  const frontDoorPasswordRef = useRef<HTMLInputElement | null>(null);
  const frontDoorPasswordField = register('frontDoorPassword');
  const frontDoorSecurityDetailRef = useRef<HTMLTextAreaElement | null>(null);
  const frontDoorSecurityDetailField = register('frontDoorSecurityDetail');
  const frontDoorEtcDetailRef = useRef<HTMLTextAreaElement | null>(null);
  const frontDoorEtcDetailField = register('frontDoorEtcDetail');

  const [validationModal, setValidationModal] = useState<ValidationModalKind | null>(null);
  const validationModalMessage =
    validationModal === 'phone'
      ? PHONE_REQUIRED_MESSAGE
      : validationModal === 'otherLocationDetail'
        ? ((otherLocationType
            ? OTHER_LOCATION_DETAIL_REQUIRED_MESSAGE[otherLocationType]
            : undefined) ?? '')
        : validationModal === 'frontDoorAccess' &&
            frontDoorAccessType &&
            frontDoorAccessType !== 'free'
          ? FRONT_DOOR_ACCESS_REQUIRED_MESSAGE[frontDoorAccessType]
          : '';

  function onValid(values: DeliveryDetailFormFields) {
    setDetail(values);
    router.back();
  }

  // 휴대폰/기타장소 세부사항은 "완전히 비어 있음"만 여기서 가로채 모달로 안내한다
  // (그 외 형식 오류는 기존 zod+인라인 에러 그대로 handleSubmit(onValid) 로 위임).
  function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const values = getValues();
    if (!values.phone.trim()) {
      setValidationModal('phone');
      return;
    }

    // 휴대폰 형식이 틀리면 공동현관/기타장소 빈 값 모달보다 인라인 에러를 먼저 보여 준다.
    const phoneDigits = values.phone.replace(/[^0-9]/g, '');
    if (PHONE_DIGITS_REGEX.test(phoneDigits)) {
      if (values.location === 'front-door') {
        if (values.frontDoorAccessType === 'password' && !values.frontDoorPassword.trim()) {
          setValidationModal('frontDoorAccess');
          return;
        }
        if (values.frontDoorAccessType === 'security' && !values.frontDoorSecurityDetail.trim()) {
          setValidationModal('frontDoorAccess');
          return;
        }
        if (values.frontDoorAccessType === 'etc' && !values.frontDoorEtcDetail.trim()) {
          setValidationModal('frontDoorAccess');
          return;
        }
      }

      if (values.location === 'other') {
        if (values.otherLocationType === 'etc' && !values.etcLocationDetail.trim()) {
          setValidationModal('otherLocationDetail');
          return;
        }
        if (values.otherLocationType === 'locker' && !values.lockerLocationDetail.trim()) {
          setValidationModal('otherLocationDetail');
          return;
        }
      }
    }

    void handleSubmit(onValid)(e);
  }

  // Modal 자체 클린업이 닫힐 때 트리거(제출 버튼)로 포커스를 되돌리므로, 그 이후 틱에서
  // 실행해야 이 포커스 이동이 되돌아가지 않는다(setTimeout 으로 한 틱 미룸).
  function handleValidationModalConfirm() {
    const target =
      validationModal === 'phone'
        ? phoneInputRef.current
        : validationModal === 'frontDoorAccess'
          ? frontDoorAccessType === 'security'
            ? frontDoorSecurityDetailRef.current
            : frontDoorAccessType === 'etc'
              ? frontDoorEtcDetailRef.current
              : frontDoorPasswordRef.current
          : otherLocationType === 'locker'
            ? lockerLocationDetailRef.current
            : etcLocationDetailRef.current;
    setValidationModal(null);
    setTimeout(() => {
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  }

  return (
    // noValidate: Input 의 `required` 는 시각적 "*" 용 마킹일 뿐이지만 네이티브 <input required>
    // 로도 그대로 흘러들어가(...props 스프레드), 없으면 브라우저 자체 검증이 submit 이벤트
    // 자체를 가로채 handleFormSubmit 이 아예 호출되지 않는다(알림 모달이 절대 뜨지 않는
    // 실제 버그로 확인됨) — 모든 검증을 zod+커스텀 모달로 직접 처리하므로 꺼둔다.
    <form onSubmit={handleFormSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
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
            {...phoneField}
            ref={(node) => {
              phoneField.ref(node);
              phoneInputRef.current = node;
            }}
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

        {/* 공동현관 출입방법 — '문 앞' 선택 시에만. node 1315-107775. */}
        {location === 'front-door' ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <FieldLabel>공동현관 출입방법</FieldLabel>

              <RadioOption
                name="frontDoorAccessType"
                value="password"
                checked={frontDoorAccessType === 'password'}
                onChange={() => setValue('frontDoorAccessType', 'password', { shouldDirty: true })}
                label="공동현관 비밀번호"
              />
              {frontDoorAccessType === 'password' ? (
                <Input
                  label="공동현관 비밀번호"
                  placeholder={FRONT_DOOR_PASSWORD_PLACEHOLDER}
                  {...frontDoorPasswordField}
                  ref={(node) => {
                    frontDoorPasswordField.ref(node);
                    frontDoorPasswordRef.current = node;
                  }}
                />
              ) : null}

              <RadioOption
                name="frontDoorAccessType"
                value="free"
                checked={frontDoorAccessType === 'free'}
                onChange={() => setValue('frontDoorAccessType', 'free', { shouldDirty: true })}
                label="자유출입 가능"
              />

              <RadioOption
                name="frontDoorAccessType"
                value="security"
                checked={frontDoorAccessType === 'security'}
                onChange={() => setValue('frontDoorAccessType', 'security', { shouldDirty: true })}
                label="경비실 호출"
              />
              {frontDoorAccessType === 'security' ? (
                <Textarea
                  label="경비실 호출 방법"
                  placeholder={FRONT_DOOR_SECURITY_PLACEHOLDER}
                  rows={3}
                  {...frontDoorSecurityDetailField}
                  ref={(node) => {
                    frontDoorSecurityDetailField.ref(node);
                    frontDoorSecurityDetailRef.current = node;
                  }}
                />
              ) : null}

              <RadioOption
                name="frontDoorAccessType"
                value="etc"
                checked={frontDoorAccessType === 'etc'}
                onChange={() => setValue('frontDoorAccessType', 'etc', { shouldDirty: true })}
                label="기타"
              />
              {frontDoorAccessType === 'etc' ? (
                <Textarea
                  label="기타 출입 방법"
                  placeholder={FRONT_DOOR_ETC_PLACEHOLDER}
                  rows={3}
                  {...frontDoorEtcDetailField}
                  ref={(node) => {
                    frontDoorEtcDetailField.ref(node);
                    frontDoorEtcDetailRef.current = node;
                  }}
                />
              ) : null}
            </div>

            <InfoBox
              variant="callout"
              icon={<Icon name="info-line" size={20} className="text-fg-tertiary" aria-hidden />}
              title="확인해주세요"
            >
              {FRONT_DOOR_ACCESS_INFO}
            </InfoBox>
          </div>
        ) : null}

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
                  placeholder={ETC_LOCATION_DETAIL_PLACEHOLDER}
                  rows={3}
                  {...etcLocationDetailField}
                  ref={(node) => {
                    etcLocationDetailField.ref(node);
                    etcLocationDetailRef.current = node;
                  }}
                />
              ) : null}

              <RadioOption
                name="otherLocationType"
                value="locker"
                checked={otherLocationType === 'locker'}
                onChange={() => setValue('otherLocationType', 'locker', { shouldDirty: true })}
                label="택배 수령실"
              />
              {otherLocationType === 'locker' ? (
                <Textarea
                  label="기타장소 세부사항 자세히"
                  placeholder={LOCKER_LOCATION_DETAIL_PLACEHOLDER}
                  rows={3}
                  {...lockerLocationDetailField}
                  ref={(node) => {
                    lockerLocationDetailField.ref(node);
                    lockerLocationDetailRef.current = node;
                  }}
                />
              ) : null}

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
            "동의하고 저장" 클릭이 곧 동의(Figma 문구 그대로). */}
        <ConsentRow />
      </div>

      <div className="bg-surface shrink-0 px-4 pt-3 pb-11">
        <Button type="submit" variant="primary" size="l" className="h-14 w-full">
          동의하고 저장
        </Button>
      </div>

      <Modal
        open={validationModal !== null}
        onClose={() => setValidationModal(null)}
        variant="alert"
        title={validationModalMessage}
        footer={
          <Button variant="text" size="m" onClick={handleValidationModalConfirm}>
            확인
          </Button>
        }
      />
    </form>
  );
}

function ConsentRow() {
  return (
    <div className="flex items-center py-1">
      {/* Figma 에 '더보기'가 있지만 펼친 약관 전문이 없다. 동작 없는 컨트롤은
          키보드·클릭이 되는 것처럼 보이므로 문구가 확정될 때까지 라벨만 둔다. */}
      <p className="text-label-l text-fg">[필수] 공동현관비밀번호 수집 및 이용 동의</p>
    </div>
  );
}
