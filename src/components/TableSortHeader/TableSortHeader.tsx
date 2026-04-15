import type { ReactNode } from "react";
import type { SortOrder } from "@/api/board";
import "@/components/TableSortHeader/TableSortHeader.scss";

// 위·아래 셰브론
export function TableSortIconNeutral() {
  return (
    <span className="table-sort-th__icon table-sort-th__icon--neutral" aria-hidden>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="m8 14 4 4 4-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m8 10 4-4 4 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

// 현재 열이 내림차순 정렬일 때
export function TableSortIconActiveDesc() {
  return (
    <span className="table-sort-th__icon table-sort-th__icon--active" aria-hidden>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="m6 9 6 6 6-6"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

// 현재 열이 오름차순 정렬일 때
export function TableSortIconActiveAsc() {
  return (
    <span className="table-sort-th__icon table-sort-th__icon--active" aria-hidden>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="m18 15-6-6-6 6"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export type TableSortThAlign = "start" | "center";

export type TableSortThProps = {
  align: TableSortThAlign;
  /** 현재 정렬이 이 열일 때 강조 아이콘 */
  active?: boolean;
  /** `active`일 때 화살표 방향 (기본 DESC) */
  sortDirection?: SortOrder;
  /** 아이콘만 클릭 가능할 때 (정렬 토글·디버그 등) */
  onIconClick?: () => void;
  /** 아이콘 버튼 접근성 라벨 (onIconClick 있을 때 권장) */
  iconButtonAriaLabel?: string;
  children: ReactNode;
};

/**
 * `<th>` 내부용: 라벨 + 정렬 아이콘
 */
export function TableSortTh({
  align,
  active,
  sortDirection = "DESC",
  onIconClick,
  iconButtonAriaLabel = "정렬 기준",
  children,
}: TableSortThProps) {
  const icon = active ? (
    sortDirection === "ASC" ? (
      <TableSortIconActiveAsc />
    ) : (
      <TableSortIconActiveDesc />
    )
  ) : (
    <TableSortIconNeutral />
  );
  const iconNode =
    onIconClick != null ? (
      <button
        type="button"
        className="table-sort-th__icon-btn"
        onClick={onIconClick}
        aria-label={iconButtonAriaLabel}
      >
        {icon}
      </button>
    ) : (
      icon
    );

  return (
    <span
      className={
        align === "center"
          ? "table-sort-th table-sort-th--align-center"
          : "table-sort-th table-sort-th--align-start"
      }
    >
      <span className="table-sort-th__label">{children}</span>
      {iconNode}
    </span>
  );
}
