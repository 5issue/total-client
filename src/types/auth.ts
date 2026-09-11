import { z } from 'zod';

import { OAUTH_PROVIDERS } from '@/lib/constants';

/** OAuth 제공자 — 카카오/네이버만 (constants.ts 와 동일 소스, 애플/컬리 자체 로그인은 범위 밖). */
export const OAuthProviderSchema = z.enum(OAUTH_PROVIDERS);
export type { OAuthProvider } from '@/lib/constants';

/**
 * Spring 백엔드 원본 응답 봉투. 우리 자신의 `{statusCode,message,data}` 봉투(apiResponse.ts, §6)와
 * 이름이 겹치지 않도록 스키마명에 `Spring` 접두를 붙인다 — Route Handler 안에서만 쓰이고
 * 브라우저로는 절대 그대로 전달하지 않는다(내부 `error` 코드 비노출 — FE-16).
 */
export function SpringEnvelopeSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    status: z.enum(['SUCCESS', 'ERROR']),
    message: z.string(),
    data: dataSchema.nullable(),
    error: z.string().nullable(),
    timestamp: z.string(),
  });
}

/** `POST /api/v1/auth/oauth/{provider}` 성공 응답의 data. */
export const SpringLoginUrlDataSchema = z.object({
  loginUrl: z.string().url(),
  provider: z.string(),
});
export type SpringLoginUrlData = z.infer<typeof SpringLoginUrlDataSchema>;

/** 소셜 프로필 — profileImageUrl 은 제공자에 따라 없을 수 있어 nullable 로 방어. */
export const AuthUserSchema = z.object({
  userId: z.number(),
  name: z.string(),
  profileImageUrl: z.string().url().nullable(),
});
export type AuthUser = z.infer<typeof AuthUserSchema>;

/** `POST /api/v1/auth/oauth/{provider}/callback` 성공 응답의 data. */
export const SpringOAuthCallbackDataSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number(),
  user: AuthUserSchema,
});
export type SpringOAuthCallbackData = z.infer<typeof SpringOAuthCallbackDataSchema>;

/** `POST /api/v1/auth/refresh` 성공 응답의 data. */
export const SpringRefreshDataSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number(),
});
export type SpringRefreshData = z.infer<typeof SpringRefreshDataSchema>;
