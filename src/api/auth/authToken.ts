import { ApiError } from "../http/errors";

// 로컬 스토리지에 저장된 토큰
export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

// 토큰 여부 확인
export function hasAuthToken(): boolean {
  return Boolean(getStoredAuthToken());
}

// JWT payload(두 번째 세그먼트)의 exp(만료, epoch seconds) 추출
// JWT 형식이 아니거나 exp가 없으면 null — 이 경우 만료 여부를 알 수 없으므로 만료로 취급하지 않음
function decodeJwtExp(token: string): number | null {
  const payloadSegment = token.split(".")[1];
  if (!payloadSegment) return null;
  try {
    const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64)) as { exp?: unknown };
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

// 저장된 토큰이 만료됐는지 확인
// 화면 진입 전 사전 필터용 UX 개선일 뿐 — 최종 검증은 항상 서버가 401로 처리
export function isStoredAuthTokenExpired(): boolean {
  const token = getStoredAuthToken();
  if (!token) return false;
  const exp = decodeJwtExp(token);
  if (exp == null) return false;
  return Date.now() >= exp * 1000;
}

// 만료된 토큰이 로컬스토리지에 남아있지 않도록 로그인 관련 항목 정리
export function clearExpiredAuthToken(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  localStorage.removeItem("userId");
  localStorage.removeItem("lastLoginAt");
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
