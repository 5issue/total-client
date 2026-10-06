/** home 도메인 쿼리 키 팩토리 (api-convention §4). */
export const homeKeys = {
  all: ['home'] as const,
  recommendations: () => [...homeKeys.all, 'recommendations'] as const,
};
