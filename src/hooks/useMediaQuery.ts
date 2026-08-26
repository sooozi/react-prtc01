import { useMemo, useSyncExternalStore } from "react";

function getServerSnapshot() {
  return false;
}

// 화면 크기 조건이 맞는지 확인
export function useMediaQuery(query: string): boolean {
  // query가 바뀌지 않는 한 같은 MediaQueryList를 재사용 — 매 렌더/read마다
  // window.matchMedia()를 새로 호출하지 않도록 memo해 둔다.
  const mql = useMemo(
    () => (typeof window !== "undefined" ? window.matchMedia(query) : null),
    [query],
  );

  return useSyncExternalStore(
    (onChange) => {
      if (!mql) return () => {};
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => mql?.matches ?? false,
    getServerSnapshot,
  );
}
