import { useSyncExternalStore } from "react";

function subscribe(query: string, onChange: () => void) {
  const m = window.matchMedia(query);
  m.addEventListener("change", onChange);
  return () => m.removeEventListener("change", onChange);
}

function getSnapshot(query: string) {
  return window.matchMedia(query).matches;
}

function getServerSnapshot() {
  return false;
}

/** `window.matchMedia` 결과를 구독한다 (SSR 시 false). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => subscribe(query, onChange),
    () => getSnapshot(query),
    getServerSnapshot,
  );
}
