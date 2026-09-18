import { redirect } from 'next/navigation';

/**
 * Toss 위젯 failUrl. 쿼리 `code` / `message` 를 읽어 `/checkout` 으로 되돌리며
 * 에러 토스트를 띄운다(#109). 인플레이스 토스트가 아니라 리다이렉트.
 */
export default async function CheckoutFailPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; message?: string }>;
}) {
  const { code, message } = await searchParams;
  const payError = message?.trim() || code?.trim() || '결제가 취소되었거나 실패했습니다.';
  redirect(`/checkout?payError=${encodeURIComponent(payError)}`);
}
