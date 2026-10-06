import { redirect } from 'next/navigation';

/**
 * Toss 위젯 failUrl. 쿼리 `code` / `message` 를 읽어 `/cart` 로 되돌리며 에러 토스트를
 * 띄운다 — 결제가 어떤 경로로 실패하든 주문서에 붙잡아두지 않고 장바구니로 보낸다
 * (#193, `CheckoutView.handleSubmitOrder`/`CheckoutSuccessView` 와 동일 정책).
 */
export default async function CheckoutFailPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; message?: string }>;
}) {
  const { code, message } = await searchParams;
  const orderError = message?.trim() || code?.trim() || '결제가 취소되었거나 실패했습니다.';
  redirect(`/cart?orderError=${encodeURIComponent(orderError)}`);
}
