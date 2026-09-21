import type { ZodType } from 'zod';

import { SpringEnvelopeSchema } from '@/types/auth';

/**
 * Route Handler가 Spring을 프록시할 때 반복되는 패턴을 하나로 묶는다 — fetch → 공용 봉투
 * 파싱 → `ERROR` 상태 정규화. 연결 실패·비 JSON 응답·스키마 불일치·Spring `ERROR` 봉투를
 * 전부 여기서 throw 하나로 모아, 호출부는 `catch` 한 번으로 `fail(502, ...)` 처리하면 된다
 * (#99 리뷰 — 봉투 없는 500이 나가면 `publicFetch` 가 `ApiEnvelope` 를 못 받아 화면이 로딩에
 * 머문다). 실패 사유별로 다른 메시지/상태코드가 필요한 라우트(예: `auth/refresh`)는 이 헬퍼
 * 대신 직접 처리한다.
 */
export async function fetchSpringData<T>(url: URL, dataSchema: ZodType<T>): Promise<T> {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
  const raw = SpringEnvelopeSchema(dataSchema).parse(await res.json());
  if (raw.status === 'ERROR' || !raw.data) {
    throw new Error('Spring upstream error');
  }
  return raw.data;
}
