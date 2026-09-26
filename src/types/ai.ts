import { z } from 'zod';

/**
 * AI 파트 서빙(FastAPI, 별도 호스트) 원본 응답 봉투. Spring 봉투(`SpringEnvelopeSchema`,
 * types/auth.ts)와 모양은 같지만(status/message/data/error/timestamp) 다른 백엔드라
 * 이름을 분리한다(AI 파트 API 명세 v0.3 §02) — Route Handler 안에서만 쓰고 브라우저로
 * 그대로 전달하지 않는다(내부 error 코드 비노출, FE-16).
 */
export function AiEnvelopeSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    status: z.enum(['SUCCESS', 'ERROR']),
    message: z.string(),
    data: dataSchema.nullable(),
    error: z.string().nullable(),
    timestamp: z.string(),
  });
}
