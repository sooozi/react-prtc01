import axios, { type AxiosInstance, isAxiosError } from "axios";
import { ApiError } from "@/api/errors";

const baseURL = import.meta.env.VITE_API_BASE_URL as string;

/**
 * API 요청에 공통으로 쓰는 axios 인스턴스
 *
 * - 서버 주소(base URL), JSON 헤더(Content-Type)는 여기 한 곳에서만 설정
 * - 실제 호출은 http.ts(api.get/post/…) 또는 이 파일을 직접 쓰는 레이어만 사용.
 *   boardApi·login 등 도메인 모듈은 @/api/http 의 api 를 사용
 * - request: localStorage 토큰이 있으면 Authorization Bearer 자동 부착 (boardApi 헤더 중복 제거)
 * - response 에러는 interceptor에서 ApiError로 통일 (401 메시지 등 중복 제거)
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

/** 로그인/가입 등 — Bearer 붙이면 안 되는 경로 (남은 토큰으로 인한 간섭 방지) */
const AUTH_PATHS_WITHOUT_BEARER = [
  "/auth/login",
  "/auth/join",
  "/auth/available/user_id",
] as const;

/** 쿼리 파라미터 제거한 경로 반환 */
function requestPathWithoutQuery(url: string | undefined): string {
  if (!url) return "";
  return url.split("?")[0] ?? "";
}

/** Bearer 붙이는 경로 여부 반환 */
function shouldAttachBearer(url: string | undefined): boolean {
  const path = requestPathWithoutQuery(url);
  return !AUTH_PATHS_WITHOUT_BEARER.some((p) => path === p);
}

// request interceptor: Bearer 붙이는 경로 여부 확인 후, 토큰 있으면 Authorization Bearer 자동 부착
apiClient.interceptors.request.use((config) => {
  if (!shouldAttachBearer(config.url)) return config;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type ErrorResponseBody = {
  resultMessage?: string;
  resultCode?: string;
  resultDetailMessage?: string;
};

apiClient.interceptors.response.use(
  (res) => res,
  (error: unknown) => {
    if (isAxiosError(error) && error.response) {
      const status = error.response.status;
      const data = error.response.data as ErrorResponseBody | undefined;
      const msg =
        data?.resultMessage ??
        (status === 401
          ? "인증이 필요합니다. 로그인 후 다시 시도해주세요."
          : `요청 실패 (${status})`);
      return Promise.reject(
        new ApiError(msg, {
          status,
          code: data?.resultCode,
          resultDetailMessage: data?.resultDetailMessage,
        })
      );
    }
    return Promise.reject(error);
  }
);
