import { normalizePhone } from '@/types/address';
import type { DeliveryDetailFormFields } from '@/types/deliveryDetail';

const FRONT_DOOR_ACCESS_LABEL: Record<DeliveryDetailFormFields['frontDoorAccessType'], string> = {
  password: '공동현관 비밀번호',
  free: '자유출입 가능',
  security: '경비실 호출',
  etc: '기타',
};

const OTHER_LOCATION_LABEL: Record<
  NonNullable<DeliveryDetailFormFields['otherLocationType']>,
  string
> = {
  etc: '기타 장소',
  locker: '택배 수령실',
  entrance: '공동현관(대문) 앞',
};

/** 주문서 배송 상세정보 한 줄 요약 — Figma node 666-24922. */
export type DeliveryDetailSummary = {
  locationLabel: string;
  accessLabel: string | null;
  passcode: string | null;
  receiverName: string;
  phone: string;
};

export function toDeliveryDetailSummary(fields: DeliveryDetailFormFields): DeliveryDetailSummary {
  const locationLabel =
    fields.location === 'front-door'
      ? '문 앞'
      : OTHER_LOCATION_LABEL[fields.otherLocationType ?? 'etc'];

  const accessLabel =
    fields.location === 'front-door'
      ? FRONT_DOOR_ACCESS_LABEL[fields.frontDoorAccessType]
      : fields.otherLocationType === 'etc'
        ? fields.etcLocationDetail.trim() || null
        : fields.otherLocationType === 'locker'
          ? fields.lockerLocationDetail.trim() || null
          : null;

  const passcode =
    fields.location === 'front-door' && fields.frontDoorAccessType === 'password'
      ? fields.frontDoorPassword.trim()
      : null;

  return {
    locationLabel,
    accessLabel,
    passcode,
    receiverName: fields.receiverName.trim(),
    phone: formatPhoneDisplay(fields.phone),
  };
}

export function formatPhoneDisplay(phone: string): string {
  const digits = normalizePhone(phone);
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}
