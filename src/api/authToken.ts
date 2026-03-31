import { ApiError } from "@/api/errors";

/** 저장된 로그인 토큰 (없으면 null). SSR 시 window 없으면 null */
export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function hasAuthToken(): boolean {
  return Boolean(getStoredAuthToken());
}

/**
 * 인증 필수 API용: 토큰 없으면 ApiError(401) throw (서버 왕복 없이 차단)
 * boardApi 등에서 공통 사용
 */
export function getAuthTokenOrThrow(): string {
  const token = getStoredAuthToken();
  if (!token) {
    throw new ApiError("인증이 필요합니다. 로그인 후 다시 시도해주세요.", {
      status: 401,
    });
  }
  return token;
}
