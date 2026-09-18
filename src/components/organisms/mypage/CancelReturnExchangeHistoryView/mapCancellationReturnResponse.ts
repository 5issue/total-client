import type { CancellationReturnEntry } from '@/types/order';

import type { CancelReturnExchangeItem, CancelReturnExchangeType } from './mock';

/**
 * Spring `CancellationReturnEntry` → 화면 `CancelReturnExchangeItem` 매핑.
 *
 * API `requestStatus` 는 자유 문자열(REQUESTED/REVIEWING/COLLECTION_PENDING/INSPECTING/
 * APPROVED/REJECTED/COMPLETED — 반품 클레임 상태 문서 기준)이고 화면은 한글 단계 라벨
 * (`STEP_LABELS`)을 쓴다 — 아래 매핑은 근사치다. "교환"은 API 자체에 없어(취소/반품만)
 * 화면에서도 계속 mock 없음 상태로 둔다.
 */
function mapRequestStatus(entry: CancellationReturnEntry): string {
  if (entry.requestType === 'CANCEL') {
    return entry.requestStatus === 'COMPLETED' ? '취소완료' : '취소접수';
  }
  switch (entry.requestStatus) {
    case 'REVIEWING':
    case 'COLLECTION_PENDING':
      return '택배회수';
    case 'INSPECTING':
      return '상품검수';
    case 'APPROVED':
    case 'COMPLETED':
      return '반품완료';
    default:
      return '반품접수';
  }
}

function formatReceivedDateLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return `접수일자 ${iso}`;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `접수일자 ${y}. ${m}. ${d}`;
}

export function mapCancellationReturnEntry(
  entry: CancellationReturnEntry,
): CancelReturnExchangeItem {
  const type: CancelReturnExchangeType = entry.requestType === 'CANCEL' ? '취소' : '반품';

  return {
    id: String(entry.requestId),
    type,
    status: mapRequestStatus(entry),
    receivedDateLabel: formatReceivedDateLabel(entry.requestedAt),
    completedAt: entry.completedAt ?? undefined,
    products: entry.items.map((item) => ({
      name: item.title,
      deliveryType: item.deliveryType,
      // API 는 정가/판매가를 따로 안 내려준다(unitPrice 하나) — 취소선 비교용 정가가
      // 필요 없는 화면이라 둘 다 같은 값으로 채운다.
      price: item.unitPrice,
      originalPrice: item.unitPrice,
      quantity: item.quantity,
      imageSrc: item.thumbnailUrl ?? undefined,
    })),
  };
}
