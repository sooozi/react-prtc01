import { useState } from "react";
import clsx from "clsx";
import { Button } from "@/components";
import "@/components/Pagination/Pagination.scss";

/** 페이지 이동 버튼 액션 타입 */
type PageAction = "first" | "prev" | "next" | "last";

/** 액션별 아이콘 매핑 */
const ACTION_ICONS: Record<PageAction, string> = {
  first: "«",
  prev: "‹",
  next: "›",
  last: "»",
};

/** 액션별 접근 가능 이름 (aria-label). title은 마우스 호버 보조용 */
const ACTION_LABELS: Record<PageAction, string> = {
  first: "첫 페이지로 이동",
  prev: "이전 페이지로 이동",
  next: "다음 페이지로 이동",
  last: "마지막 페이지로 이동",
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
  const actionLabel = ACTION_LABELS[action];
  const ariaLabel = disabled ? `${actionLabel}, 사용할 수 없음` : actionLabel;

  return (
    <Button
      type="button"
      variant="ghost"
      className={clsx("page-move-btn", `page-${action}`, disabled && "disabled", className)}
      disabled={disabled}
      {...rest}
      aria-label={ariaLabel}
      title={actionLabel}
    >
      <span aria-hidden>{ACTION_ICONS[action]}</span>
    </Button>
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
  // 입력 중인 값(null이면 currentPage 표시)
  const [draft, setDraft] = useState<string | null>(null);
  const [prevCurrentPage, setPrevCurrentPage] = useState(currentPage);

  if (currentPage !== prevCurrentPage) {
    setPrevCurrentPage(currentPage);
    setDraft(null);
  }

  const inputValue = draft ?? String(currentPage);

  // 총 페이지가 1개 이하면 렌더링하지 않음
  if (totalPages <= 1) return null;

  // 이전 페이지 이동 핸들러
  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  // 다음 페이지 이동 핸들러
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // 페이지 번호 입력 필드 값 변경 시 페이지 번호 적용
  const applyPageInput = () => {
    // 페이지 번호 입력 필드 값 파싱 (공백 제거, 10진수로 파싱)
    const num = parseInt(inputValue.trim(), 10);
    // 페이지 번호 입력 필드 값이 숫자가 아니거나 1보다 작으면 현재 페이지로 설정
    if (Number.isNaN(num) || num < 1) {
      setDraft(null);
      return;
    }
    // 페이지 번호 입력 필드 값이 전체 페이지 수보다 크면 전체 페이지 수로 설정
    const page = Math.min(num, totalPages);
    // 페이지 번호 변경
    onPageChange(page);
    setDraft(null);
  };

  // 페이지 번호 입력 필드 값 변경 시 페이지 번호 적용
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyPageInput();
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

      {/* 페이지 번호 (입력 가능) */}
      <div className="page-numbers">
        <input
          type="text"
          className="page-current-input"
          value={inputValue}
          onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))} // 숫자가 아닌 문자 제거
          onBlur={applyPageInput} // 페이지 번호 입력 필드 값 변경 시 페이지 번호 적용
          onKeyDown={handleKeyDown} // 페이지 번호 입력 필드 값 변경 시 페이지 번호 적용
          aria-label={`페이지 번호 입력, 1부터 ${totalPages}까지. Enter 또는 포커스를 벗어나면 해당 페이지로 이동합니다.`}
        />
        <span className="page-divider" aria-hidden="true">
          /
        </span>
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
