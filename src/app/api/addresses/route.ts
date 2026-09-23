import { type NextRequest } from 'next/server';

import { proxySpringAddress } from '@/lib/address/springProxy';
import { fail } from '@/lib/apiResponse';
import { isSameOrigin } from '@/lib/assertSameOrigin';
import {
  AddressListResponseSchema,
  CreateAddressResponseSchema,
  SaveAddressRequestSchema,
} from '@/types/address';

// 실제 배송지 엔드포인트는 user-service 소유 — `/api/v1/addresses` 가 아니라
// `/api/v1/users/me/addresses` (types/address.ts 계약 노트 참고, 2026-09-22 확인).
const ADDRESSES_PATH = '/api/v1/users/me/addresses';

/** 배송지 목록 조회. */
export async function GET(req: NextRequest) {
  return proxySpringAddress(req, ADDRESSES_PATH, AddressListResponseSchema, {
    method: 'GET',
    failureMessage: '배송지 목록을 불러오는 중 오류가 발생했습니다.',
  });
}

/** 배송지 추가. */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return fail(403, '요청을 처리할 수 없습니다.');
  }

  const parsed = SaveAddressRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return fail(400, '배송지 정보를 확인해주세요.');
  }

  // 백엔드는 전체 Address 가 아니라 { addressId, success } 만 돌려준다.
  return proxySpringAddress(req, ADDRESSES_PATH, CreateAddressResponseSchema, {
    method: 'POST',
    body: parsed.data,
    failureMessage: '배송지 추가 중 오류가 발생했습니다.',
  });
}
