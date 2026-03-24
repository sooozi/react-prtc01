export type ApiErrorOptions = {
  status?: number;
  code?: string;
  resultDetailMessage?: string;
};

/**
 * API/HTTP 실패 시 공통으로 던지는 에러
 * axios response interceptor에서 생성하거나, 클라이언트 측 검증(토큰 없음 등)에서 사용
 */
export class ApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly resultDetailMessage?: string;

  constructor(message: string, options?: ApiErrorOptions) {
    super(message);
    this.name = "ApiError";
    this.status = options?.status; // 상태 코드
    this.code = options?.code; // 응답 JSON의 resultCode
    this.resultDetailMessage = options?.resultDetailMessage; // 상세 메시지
  }
}