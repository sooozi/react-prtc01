const TOAST_KEY = "bplte:loginRedirectToast";
const FROM_KEY = "bplte:loginRedirectFrom";

export type LoginRedirectFromPayload = {
  pathname: string;
  search: string;
  hash: string;
};

function isAuthPagePath(path: string): boolean {
  return (
    path === "/auth/login" ||
    path === "/auth/signup" ||
    path.startsWith("/auth/login/") ||
    path.startsWith("/auth/signup/")
  );
}

// 같은 401을 axios 인터셉터·reportApiErrorToUser 양쪽에서 각자 처리하면서
// 중복 호출되는 경우가 있어, 페이지 이동이 시작되면 이후 호출은 무시
let redirecting = false;

/**
 * 401 등 — 로그인으로 보내고 토스트는 sessionStorage에 넣음 (axios 인터셉터·getAuthTokenOrThrow catch 공통)
 */
export function redirectUnauthorizedToLogin(toast: string): void {
  if (typeof window === "undefined") return;
  if (redirecting) return;
  const path = window.location.pathname;
  if (isAuthPagePath(path)) return;
  redirecting = true;

  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  localStorage.removeItem("userId");
  localStorage.removeItem("lastLoginAt");

  sessionStorage.setItem(TOAST_KEY, toast);
  sessionStorage.setItem(
    FROM_KEY,
    JSON.stringify({
      pathname: path || "/",
      search: window.location.search,
      hash: window.location.hash,
    } satisfies LoginRedirectFromPayload),
  );
  window.location.replace("/auth/login");
}

/** 로그인 페이지 마운트 시 한 번 읽고 비움 */
export function consumeLoginRedirectSession(): {
  toast: string | null;
  from: LoginRedirectFromPayload | null;
} {
  if (typeof window === "undefined") return { toast: null, from: null };
  const toast = sessionStorage.getItem(TOAST_KEY);
  const fromRaw = sessionStorage.getItem(FROM_KEY);
  if (toast != null) sessionStorage.removeItem(TOAST_KEY);
  if (fromRaw != null) sessionStorage.removeItem(FROM_KEY);

  let from: LoginRedirectFromPayload | null = null;
  if (fromRaw) {
    try {
      const parsed = JSON.parse(fromRaw) as LoginRedirectFromPayload;
      if (typeof parsed?.pathname === "string") from = parsed;
    } catch {
      from = null;
    }
  }
  return { toast: toast ?? null, from };
}
