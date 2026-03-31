import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

/** 목록 URL의 페이지 쿼리 키 (한곳에서만 관리) */
export const URL_PAGE_QUERY_KEY = "page";

/**
 * URL `?page=` 와 동기화되는 현재 페이지.
 * - 읽기: 없거나 잘못된 값이면 1
 * - 쓰기: 나머지 쿼리(sort 등)는 유지한 채 `page`만 갱신
 */
export function useUrlQueryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = useMemo(() => {
    const raw = searchParams.get(URL_PAGE_QUERY_KEY);
    const n = parseInt(raw ?? "1", 10);
    if (Number.isNaN(n) || n < 1) return 1;
    return n;
  }, [searchParams]);

  const setCurrentPage = useCallback(
    (page: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set(URL_PAGE_QUERY_KEY, String(page));
        return next;
      });
    },
    [setSearchParams]
  );

  useEffect(() => {
    const raw = searchParams.get(URL_PAGE_QUERY_KEY);
    const num = raw !== null ? parseInt(raw, 10) : NaN;
    const isValid = !Number.isNaN(num) && num >= 1;
    if (!isValid) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set(URL_PAGE_QUERY_KEY, "1");
        return next;
      });
    }
  }, [searchParams, setSearchParams]);

  return { currentPage, setCurrentPage, searchParams, setSearchParams };
}
