import { z } from 'zod';

/** 원화 금액(원 단위 정수). 표시 포맷은 `formatters.ts` 의 `formatPrice` 가 담당한다. */
export const MoneySchema = z.number().int().nonnegative();

/** 커서 기반 목록 응답 공통 필드. */
export const PaginationSchema = z.object({
  totalCount: z.number().int().nonnegative(),
  nextCursor: z.string().nullable(),
});
export type Pagination = z.infer<typeof PaginationSchema>;
