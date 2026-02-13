import clsx from "clsx";
import "./Pagination.scss";

/** 페이지 이동 버튼 액션 타입 */
type PageAction = "first" | "prev" | "next" | "last";

/** 액션별 아이콘 매핑 */
const ACTION_ICONS: Record<PageAction, string> = {
  first: "«",
  prev: "‹",
  next: "›",
  last: "»",
};

/** 액션별 title 매핑 */
const ACTION_TITLES: Record<PageAction, string> = {
  first: "첫 페이지",
  prev: "이전 페이지",
  next: "다음 페이지",
  last: "마지막 페이지",
};

interface PageMoveButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  action: PageAction;
}

/** 페이지 이동 버튼 (Pagination 내부에서만 사용) */
function PageMoveButton({
  action,
  disabled,
  className,
  ...rest
}: PageMoveButtonProps) {
  return (
    <button
      type="button"
      className={clsx("page-move-btn", `page-${action}`, disabled && "disabled", className)}
      disabled={disabled}
      title={ACTION_TITLES[action]}
      {...rest}
    >
      {ACTION_ICONS[action]}
    </button>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** 페이지 변경 핸들러 */
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // 총 페이지가 1개 이하면 렌더링하지 않음
  if (totalPages <= 1) return null;

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="pagination">
      <PageMoveButton
        action="first"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      />
      <PageMoveButton
        action="prev"
        onClick={handlePrevPage}
        disabled={currentPage === 1}
      />

      {/* 페이지 번호 */}
      <div className="page-numbers">
        <span className="page-current">{currentPage}</span>
        <span className="page-divider">/</span>
        <span className="page-total">{totalPages}</span>
      </div>

      <PageMoveButton
        action="next"
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
      />
      <PageMoveButton
        action="last"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      />
    </div>
  );
}
