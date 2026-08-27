import { useSyncExternalStore } from "react";

function subscribe(key: string, onChange: () => void) {
  const handler = (e: StorageEvent) => {
    // e.key가 null이면 localStorage.clear() — 모든 키에 영향
    if (e.key === key || e.key === null) onChange();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function getSnapshot(key: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

function getServerSnapshot(): string | null {
  return null;
}

/**
 * localStorage 값을 읽고, 다른 탭에서 값이 바뀌면(로그인/로그아웃 등) 자동으로 리렌더.
 * `storage` 이벤트는 브라우저 스펙상 값을 바꾼 탭 자신에게는 발생하지 않고
 * 다른 탭에만 발생 — 그래서 이 훅은 "다른 탭에서 바뀐 걸 반영"하는 용도.
 */
export function useLocalStorageValue(key: string): string | null {
  return useSyncExternalStore(
    (onChange) => subscribe(key, onChange),
    () => getSnapshot(key),
    getServerSnapshot,
  );
}
