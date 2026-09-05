import { type NextRequest } from 'next/server';

import { fail, ok } from '@/lib/apiResponse';
import { isOAuthProvider } from '@/lib/constants';
import { env } from '@/lib/env';
import { SpringEnvelopeSchema, SpringLoginUrlDataSchema } from '@/types/auth';

/**
 * 카카오/네이버 로그인 URL 발급 — 로그인 버튼 클릭 시 `useOAuthLogin` 이 호출.
 * `redirectUri` 는 클라이언트 입력을 신뢰하지 않고 요청 origin 에서 서버가 직접 계산한다
 * (카카오/네이버 콘솔에 등록된 값과 일치해야 하며, `/callback/[provider]` 가 그 착지 지점).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;

  if (!isOAuthProvider(provider)) {
    return fail(400, '지원하지 않는 서비스 제공자입니다.');
  }

  const redirectUri = new URL(`/callback/${provider}`, req.nextUrl.origin).toString();

  const springRes = await fetch(`${env.API_INTERNAL_URL}/api/v1/auth/oauth/${provider}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: provider.toUpperCase(), redirectUri }),
  });

  const raw = SpringEnvelopeSchema(SpringLoginUrlDataSchema).parse(await springRes.json());

  if (raw.status === 'ERROR' || !raw.data) {
    return fail(springRes.status, raw.message);
  }

  return ok(raw.data);
}
