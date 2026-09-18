import { type NextRequest } from 'next/server';

import { proxySpringAddress } from '@/lib/address/springProxy';
import { fail } from '@/lib/apiResponse';
import {
  AddressSchema,
  DeleteAddressResponseSchema,
  SaveAddressRequestSchema,
} from '@/types/address';

function parseAddressId(addressId: string) {
  const num = Number(addressId);
  return Number.isInteger(num) && num > 0 ? num : null;
}

/** 배송지 수정. */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ addressId: string }> },
) {
  const { addressId } = await params;
  const addressIdNum = parseAddressId(addressId);
  if (addressIdNum === null) {
    return fail(400, '올바르지 않은 배송지 ID입니다.');
  }

  const parsed = SaveAddressRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return fail(400, '배송지 정보를 확인해주세요.');
  }

  return proxySpringAddress(req, `/api/v1/addresses/${addressIdNum}`, AddressSchema, {
    method: 'PUT',
    body: parsed.data,
    failureMessage: '배송지 수정 중 오류가 발생했습니다.',
  });
}

/** 배송지 삭제. */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ addressId: string }> },
) {
  const { addressId } = await params;
  const addressIdNum = parseAddressId(addressId);
  if (addressIdNum === null) {
    return fail(400, '올바르지 않은 배송지 ID입니다.');
  }

  return proxySpringAddress(req, `/api/v1/addresses/${addressIdNum}`, DeleteAddressResponseSchema, {
    method: 'DELETE',
    failureMessage: '배송지 삭제 중 오류가 발생했습니다.',
  });
}
