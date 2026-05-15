import type { SortOrder } from "@/api/board";

export type BoardSortColumn = "postNumber" | "title" | "rgtrName" | "inqCnt" | "regDt";

export const BOARD_SORT_COLUMN_API: Record<BoardSortColumn, string> = {
  postNumber: "postNumber",
  title: "title",
  rgtrName: "rgtrName",
  inqCnt: "inqCnt",
  regDt: "regDt",
};

/** 초기 목록 정렬(디폴트): 등록일시 내림차순 */
export const BOARD_LIST_DEFAULT_COLUMN: BoardSortColumn = "regDt";

// 정렬 상태 타입
export type BoardListSortPhase = "default" | "desc" | "asc";

// 정렬 상태 타입
export type BoardListSortState = {
  phase: BoardListSortPhase;
  column: BoardSortColumn;
};

// 초기 정렬 상태
export const INITIAL_BOARD_LIST_SORT: BoardListSortState = {
  phase: "default",
  column: BOARD_LIST_DEFAULT_COLUMN,
};

// 정렬 상태 다음 상태 계산
export function nextBoardListSortState(
  prev: BoardListSortState,
  clicked: BoardSortColumn
): BoardListSortState {
  if (prev.phase === "default") { // 초기 상태일 때
    return { phase: "desc", column: clicked };
  }
  if (prev.phase === "desc") { // 내림차순 상태일 때
    if (clicked === prev.column) { // 같은 열을 또 눌렀을 때
      return { phase: "asc", column: prev.column };
    }
    return { phase: "desc", column: clicked };
  }
  // prev.phase === "asc"
  if (clicked === prev.column) { // 같은 열을 또 눌렀을 때
    return INITIAL_BOARD_LIST_SORT;
  }
  return { phase: "desc", column: clicked }; // 다른 열을 눌렀을 때
}

// 정렬 상태를 API 파라미터로 변환
export function boardListSortToApiParams(state: BoardListSortState): {
  sortColumnName: string;
  sortType: SortOrder;
} {
  if (state.phase === "default") {
    return {
      sortColumnName: BOARD_SORT_COLUMN_API[BOARD_LIST_DEFAULT_COLUMN],
      sortType: "DESC",
    };
  }
  if (state.phase === "desc") {
    return {
      sortColumnName: BOARD_SORT_COLUMN_API[state.column],
      sortType: "DESC",
    };
  }
  return {
    sortColumnName: BOARD_SORT_COLUMN_API[state.column],
    sortType: "ASC",
  };
}

// 정렬 헤더 활성 여부 (phase가 default면 API는 여전히 등록일시 DESC지만, UI는 ‘명시적 정렬 없음’으로 모두 중립 아이콘)
export function isBoardSortColumnActive(
  state: BoardListSortState,
  column: BoardSortColumn
): boolean {
  if (state.phase === "default") {
    return false;
  }
  return state.column === column;
}

// 정렬 헤더 방향
export function boardSortColumnDirection(state: BoardListSortState): SortOrder {
  if (state.phase === "default") {
    return "DESC";
  }
  return state.phase === "desc" ? "DESC" : "ASC";
}

// 정렬 헤더 목록
export const BOARD_SORT_HEADERS: {
  column: BoardSortColumn;
  label: string;
  align: "start" | "center";
  /** `th-*` 접미사 (예: number → class `th th-number`) */
  thClassSuffix: string;
}[] = [
  { column: "postNumber", label: "번호", align: "center", thClassSuffix: "number" },
  { column: "title", label: "제목", align: "start", thClassSuffix: "title" },
  { column: "rgtrName", label: "등록자", align: "center", thClassSuffix: "rgtr" },
  { column: "inqCnt", label: "조회", align: "center", thClassSuffix: "view" },
  { column: "regDt", label: "등록일시", align: "center", thClassSuffix: "date" },
];
