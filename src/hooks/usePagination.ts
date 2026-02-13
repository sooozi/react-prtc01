import { useState } from "react";

export function usePagination(pageSize: number) {
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
