import { useState } from "react";

export const DEFAULT_PAGE_SIZE = 10;

export function usePagination(pageSize: number = DEFAULT_PAGE_SIZE) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // 전체 페이지 수 계산  
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // 페이지 이동
  const goToPage = (page: number) => {
    // 페이지 번호 유효성 검사
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  return {
    currentPage,
    setCurrentPage,
    goToPage,
    totalItems,
    setTotalItems,
    totalPages,
    pageSize,
  };
}
