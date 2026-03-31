/**
 * API 공통 응답 타입
 * 백엔드가 내려주는 JSON 구조를 한 곳에서 정의
 */
export type ApiResponse<T = unknown> = {
  resultCode: string;
  resultMessage?: string;
  resultDetailMessage?: string;
  data: T;
};
