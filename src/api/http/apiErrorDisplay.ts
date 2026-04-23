import { isAxiosError } from "axios";
import { redirectUnauthorizedToLogin } from "../auth/loginRedirectSession";
import { ApiError } from "./errors";

let text = "";
const listeners = new Set<() => void>();

function emit() {
  for (const fn of listeners) {
    fn();
  }
}

export function getGlobalApiErrorText(): string {
  return text;
}

export function setGlobalApiErrorText(message: string): void {
  text = message;
  emit();
}

export function clearGlobalApiError(): void {
  if (text === "") return;
  text = "";
  emit();
}

export function subscribeGlobalApiError(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

/**
 * API 실패 응답(화면이 아닌) 메시지 한 줄로
 */
export function getUserFacingApiMessage(e: unknown): string {
  if (e instanceof ApiError) {
    const d = e.resultDetailMessage ? ` ${e.resultDetailMessage}` : "";
    return `${e.message}${d}`.trim();
  }
  if (e instanceof Error) {
    return e.message;
  }
  return "요청에 실패했습니다.";
}

/**
 * 401(인터셉터에서 이미 로그인으로 보냄) / 403 / 404 → 화면 문구는 생략(이동 등 처리됨)
 */
function shouldSuppressUiMessageForStatus(status?: number): boolean {
  return status === 401 || status === 403 || status === 404;
}

/**
 * 로그·전역 문구(인라인 catch 대체). 401로 로그인 보낸 뒤에는 광고/문구를 생략
 */
export function reportApiErrorToUser(e: unknown): void {
  if (e instanceof ApiError) { // ApiError 인스턴스인 경우
    if (e.status === 401) { // 401 상태 코드인 경우
      redirectUnauthorizedToLogin(e.message);
      return;
    }
    if (shouldSuppressUiMessageForStatus(e.status)) { // 401, 403, 404 상태 코드인 경우
      return;
    }
  }
  if (isAxiosError(e)) { // AxiosError 인스턴스인 경우
    if (e.response) {
      const s = e.response.status;
      if (shouldSuppressUiMessageForStatus(s)) { // 401, 403, 404 상태 코드인 경우
        return;
      }
    } else {
      setGlobalApiErrorText("네트워크에 연결할 수 없습니다. 연결을 확인한 뒤 다시 시도해주세요."); // 네트워크 연결 실패 메시지
      return;
    }
  }
  setGlobalApiErrorText(getUserFacingApiMessage(e));
}
