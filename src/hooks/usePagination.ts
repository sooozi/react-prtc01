import { useState } from "react";

export const DEFAULT_PAGE_SIZE = 10;

export function usePagination(pageSize: number = DEFAULT_PAGE_SIZE) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const goToPage = (page: number) => {
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
