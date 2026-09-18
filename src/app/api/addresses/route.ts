import { type NextRequest } from 'next/server';

import { proxySpringAddress } from '@/lib/address/springProxy';
import { fail } from '@/lib/apiResponse';
import {
  AddressListResponseSchema,
  AddressSchema,
  SaveAddressRequestSchema,
} from '@/types/address';

/** 배송지 목록 조회. */
export async function GET(req: NextRequest) {
  return proxySpringAddress(req, '/api/v1/addresses', AddressListResponseSchema, {
    method: 'GET',
    failureMessage: '배송지 목록을 불러오는 중 오류가 발생했습니다.',
  });
}

/** 배송지 추가. */
export async function POST(req: NextRequest) {
  const parsed = SaveAddressRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return fail(400, '배송지 정보를 확인해주세요.');
  }

  return proxySpringAddress(req, '/api/v1/addresses', AddressSchema, {
    method: 'POST',
    body: parsed.data,
    failureMessage: '배송지 추가 중 오류가 발생했습니다.',
  });
}
