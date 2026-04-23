import { useEffect, useSyncExternalStore } from "react";
import {
  clearGlobalApiError,
  getGlobalApiErrorText,
  subscribeGlobalApiError,
} from "@/api/http/apiErrorDisplay";
import "./ApiErrorBar.scss";

/**
 * `reportApiErrorToUser` / `setGlobalApiErrorText`로 올라온 API 오류를 레이아웃 상단에 표시
 */
export default function ApiErrorBar() {
  const message = useSyncExternalStore(
    subscribeGlobalApiError,
    getGlobalApiErrorText,
    getGlobalApiErrorText
  );

  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => clearGlobalApiError(), 8000);
    return () => clearTimeout(t);
  }, [message]);

  if (!message) {
    return null;
  }

  return (
    <div className="api-error-bar" role="alert">
      <span className="api-error-bar__text">{message}</span>
      <button
        type="button"
        className="api-error-bar__dismiss"
        onClick={() => clearGlobalApiError()}
        aria-label="오류 메시지 닫기"
      >
        ×
      </button>
    </div>
  );
}
