import { ApiError } from "../http/errors";

// 로컬 스토리지에 저장된 토큰 (없으면 null)
export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

// 토큰 여부 확인(불리언)
export function hasAuthToken(): boolean {
  return Boolean(getStoredAuthToken());
}

// 인증 필수 API용: 토큰 없으면 ApiError(401) throw (서버 왕복 없이 차단)
export function getAuthTokenOrThrow(): string {
  const token = getStoredAuthToken();
  if (!token) {
    throw new ApiError("인증이 필요합니다. 로그인 후 다시 시도해주세요.", {
      status: 401,
    });
  }
  return token;
}
