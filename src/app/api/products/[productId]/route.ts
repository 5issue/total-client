import { type NextRequest } from 'next/server';

import { fail, ok } from '@/lib/apiResponse';
import { env } from '@/lib/env';
import { SpringEnvelopeSchema } from '@/types/auth';
import { SpringProductDetailDataSchema } from '@/types/product';

/**
 * 상품 상세 조회 — `useProductDetail` 이 호출. 인증 불필요(`publicFetch`).
 * `src/app/api/products/route.ts`(목록 조회)와 동일한 패턴 — upstream 실패는 원인을
 * 가리지 않고 같은 메시지로 내린다(구현 세부 노출 방지).
 */
const UPSTREAM_FAILURE_MESSAGE = '상품 정보를 불러오지 못했습니다.';

/** upstream 응답 헤더 대기 상한 — 없으면 Node 24 기본 fetch(Undici) 타임아웃(300초) 동안
 * Route Handler와 클라이언트 요청이 pending 상태로 남는다(코드래빗 리뷰 반영). */
const UPSTREAM_TIMEOUT_MS = 5000;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;

  if (!/^\d+$/.test(productId)) {
    return fail(400, '상품 ID가 올바르지 않습니다.');
  }

  let raw;
  try {
    const springRes = await fetch(`${env.API_INTERNAL_URL}/api/v1/products/${productId}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    raw = SpringEnvelopeSchema(SpringProductDetailDataSchema).parse(await springRes.json());
  } catch {
    // 연결 실패·비 JSON 응답·스키마 불일치가 전부 여기로 온다. 그대로 두면 Next 의
    // 프레임워크 오류 응답(봉투 없는 500)이 나가 `publicFetch` 가 `ApiEnvelope` 를
    // 못 받고, 화면은 에러 대신 로딩에 머문다(list route.ts #99 리뷰와 동일 이유).
    return fail(502, UPSTREAM_FAILURE_MESSAGE);
  }

  // 상태 코드와 메시지를 upstream 그대로 흘리지 않는다 — Spring 은 HTTP 200 + ERROR 봉투도
  // 보낼 수 있어 브라우저가 성공으로 오해하고, `raw.message` 엔 구현 세부가 섞일 수 있다
  // (security-convention FE-16).
  if (raw.status === 'ERROR' || !raw.data) {
    return fail(502, UPSTREAM_FAILURE_MESSAGE);
  }

  return ok(raw.data);
}
