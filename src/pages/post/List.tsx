import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { selectBoardList, BoardApiError } from "@/api/board";
import type { Post, SortOrder } from "@/api/board";
import { Badge, Button, LoadingState, Pagination, Tooltip } from "@/components";
import { usePagination } from "@/hooks/usePagination";
import { URL_PAGE_QUERY_KEY, useUrlQueryPage } from "@/hooks/useUrlQueryPage";
import "@/pages/post/List.scss";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "regDt", label: "최신순" },
  { value: "title", label: "제목순" },
  { value: "inqCnt", label: "조회순" },
  { value: "postNumber", label: "번호순" },
  { value: "rgtrName", label: "등록자순" },
];

const ORDER_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "DESC", label: "내림차순" },
  { value: "ASC", label: "오름차순" },
];

// URL에서 정렬 컬럼 (기본: regDt)
function getSortFromSearchParams(searchParams: URLSearchParams): string {
  const v = searchParams.get("sort");
  // 정렬 컬럼이 SORT_OPTIONS에 있는지 확인
  return v && SORT_OPTIONS.some((o) => o.value === v) ? v : "regDt";
}

// URL에서 정렬 타입 (기본: DESC)
function getOrderFromSearchParams(searchParams: URLSearchParams): SortOrder {
  const v = searchParams.get("order");
  return v === "ASC" || v === "DESC" ? v : "DESC";
}

//[검색] API에 실제로 넘긴 검색어가 하나라도 있으면 true (빈 목록 문구용)
function hasAppliedSearch(title: string, rgtrId: string, rgtrName: string): boolean {
  return Boolean(title.trim() || rgtrId.trim() || rgtrName.trim());
}

type BoardSortHeaderButtonProps = {
  ariaLabel: string;
  onClick: () => void;
};

/** 테이블 헤더 정렬: 아이콘만 있는 버튼 (이름은 aria-label로 제공) */
function BoardSortHeaderButton({ ariaLabel, onClick }: BoardSortHeaderButtonProps) {
  return (
    <button type="button" className="board-th-sort-btn" aria-label={ariaLabel} onClick={onClick}>
      <svg
        className="board-th-sort-btn__svg"
        viewBox="0 0 24 24"
        width={15}
        height={15}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 10l4-4 4 4" />
        <path d="M8 14l4 4 4-4" />
      </svg>
    </button>
  );
}

export default function List() {
  const navigate = useNavigate();
  const { currentPage, setCurrentPage, searchParams, setSearchParams } = useUrlQueryPage();
  const [posts, setPosts] = useState<Post[]>([]); // 게시글 목록
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const sort = getSortFromSearchParams(searchParams);
  const order = getOrderFromSearchParams(searchParams);

  /** 입력창에 쓰는 값 (검색 버튼 누르기 전까지 API에는 반영 안 함) */
  const [draftTitle, setDraftTitle] = useState("");
  const [draftRgtrId, setDraftRgtrId] = useState("");
  const [draftRgtrName, setDraftRgtrName] = useState("");
  /** 마지막으로 "검색"을 눌렀을 때 확정된 조건 — selectBoardList에만 사용 */
  const [appliedTitle, setAppliedTitle] = useState("");
  const [appliedRgtrId, setAppliedRgtrId] = useState("");
  const [appliedRgtrName, setAppliedRgtrName] = useState("");

  const { totalItems, setTotalItems, totalPages, pageSize } = usePagination();

  const openPostDetail = useCallback(
    (id: number) => {
      navigate(`/post/detail?id=${id}`);
    },
    [navigate]
  );

  // 정렬 변경: URL의 page·sort·order만 갱신 (검색 state는 그대로)
  const handleSortChange = (newSort: string, newOrder: SortOrder) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set(URL_PAGE_QUERY_KEY, "1");
      next.set("sort", newSort);
      next.set("order", newOrder);
      return next;
    });
  };

  /**
   * 테이블 헤더 정렬 버튼 클릭 시
   * > 지금 보고 있던 sort column을 또 누르면: 오름차순 ↔ 내림차순만 바꿈
   * > 다른 sort column을 누르면: 그 column로 바꾸고, 순서는 내림차순부터
   */
  const handleHeaderSort = useCallback(
    (column: string) => {
      // 검색 조건 설정
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set(URL_PAGE_QUERY_KEY, "1"); // 페이지 번호를 1로 설정
        const currentSort = getSortFromSearchParams(prev);
        const currentOrder = getOrderFromSearchParams(prev);
        next.set("sort", column); // 정렬 컬럼을 누른 컬럼으로 설정
        next.set(
          "order",
          currentSort === column ? (currentOrder === "ASC" ? "DESC" : "ASC") : "DESC"
        ); // 순서는 오름차순 ↔ 내림차순만 바꿈
        return next;
      });
    },
    [setSearchParams]
  );

  /** 검색 버튼 클릭 시 입력값을 applied로 복사하고 1페이지로 이동 (주소에는 검색어 안 붙음) */
  const applySearch = () => {
    setAppliedTitle(draftTitle.trim());
    setAppliedRgtrId(draftRgtrId.trim());
    setAppliedRgtrName(draftRgtrName.trim());
    setCurrentPage(1);
  };

  // 게시글 목록 조회
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        setIsUnauthorized(false);

        // GET /posts — 페이지·정렬·검색 조건을 쿼리로 전달 (스웨거 SelectBoardList와 동일 필드)
        const res = await selectBoardList({
          page: currentPage, // URL ?page= 과 동기화
          size: pageSize, // 한 페이지 글 개수 (usePagination)
          sortColumnName: sort, // URL ?sort= → 백엔드 sortColumnName (예: regDt, title)
          sortType: order, // URL ?order= → ASC | DESC
          titleSearchKeyword: appliedTitle || undefined, // 검색 확정값만 전달; 빈 문자열은 undefined로 보내 쿼리에서 제외
          rgtrIdSearchKeyword: appliedRgtrId || undefined,
          rgtrNameSearchKeyword: appliedRgtrName || undefined,
        });

        // 응답 데이터 파싱
        const payload = res?.data;
        // 게시글 목록 설정
        setPosts(payload?.data ?? []);
        // 전체 게시글 수 설정
        const total = payload?.totalItemSize ?? 0;
        // 전체 게시글 수 설정
        setTotalItems(total);
        // 전체 페이지 수 계산
        const computedTotalPages = Math.max(1, Math.ceil(total / pageSize));
        // 현재 페이지가 전체 페이지 수보다 크면 마지막 페이지로 이동
        if (currentPage > computedTotalPages) setCurrentPage(computedTotalPages);
      } catch (e: unknown) {
        if (e instanceof BoardApiError && e.status === 401) {
          setError(e.message);
          setIsUnauthorized(true);
        } else { 
          setError(e instanceof Error ? e.message : "게시글 목록 조회 실패");
        }
      } finally {
        setLoading(false);
      }
    };

    // 게시글 목록 조회
    fetchData();
  }, [
    currentPage,
    pageSize,
    sort,
    order,
    appliedTitle,
    appliedRgtrId,
    appliedRgtrName,
    setCurrentPage,
    setTotalItems,
  ]);

  return (
    <div className="board-page">
      <div className="list-page-head">
        <div className="title-block">
          <Badge>📋 Board</Badge>
          <h1 className="title">게시판</h1>
          <p className="subtitle">
            전체 <strong>{totalItems}</strong>개의 게시글
          </p>
        </div>
      </div>

      <div className="board-write-btn-container">
        <section className="board-search-panel" aria-label="게시글 검색">
          <form
            className="board-search-panel__form"
            onSubmit={(e) => {
              e.preventDefault();
              applySearch();
            }}
          >
            <div className="board-search-toolbar">
              <div className="board-search-fields-cluster" role="group" aria-label="검색 조건">
                <label className="board-search-field board-search-field--segment">
                  <span className="board-search-field__label">제목</span>
                  <input
                    type="search"
                    className="board-search-field__input"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    placeholder="검색어 입력"
                    autoComplete="off"
                  />
                </label>
                <label className="board-search-field board-search-field--segment">
                  <span className="board-search-field__label">등록자 ID</span>
                  <input
                    type="search"
                    className="board-search-field__input"
                    value={draftRgtrId}
                    onChange={(e) => setDraftRgtrId(e.target.value)}
                    placeholder="아이디"
                    autoComplete="off"
                  />
                </label>
                <label className="board-search-field board-search-field--segment">
                  <span className="board-search-field__label">등록자 이름</span>
                  <input
                    type="search"
                    className="board-search-field__input"
                    value={draftRgtrName}
                    onChange={(e) => setDraftRgtrName(e.target.value)}
                    placeholder="이름"
                    autoComplete="off"
                  />
                </label>
              </div>
              <div className="board-search-actions">
                <Button type="submit" variant="primary" size="sm">
                  검색
                </Button>
              </div>
            </div>
          </form>
        </section>

        <div className="board-write-btn-block">
          <div className="board-list-controls">
            <label className="board-sort-label">
              정렬
              <select
                className="board-sort-select"
                value={sort}
                onChange={(e) => handleSortChange(e.target.value, order)}
                aria-label="정렬 기준"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="board-sort-label">
              순서
              <select
                className="board-sort-select"
                value={order}
                onChange={(e) => handleSortChange(sort, e.target.value as SortOrder)}
                aria-label="정렬 순서"
              >
                {ORDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <Button variant="primary" size="sm" onClick={() => navigate("/post/write")}>
            글쓰기
          </Button>
        </div>

        <div className="table-card">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <div className="error-state">
              <span className="error-icon">⚠️</span>
              <span className="error-title">{isUnauthorized ? "인증 필요" : "연결 오류"}</span>
              <span className="error-message">{error}</span>
              {isUnauthorized && (
                <Button
                  variant="primary"
                  onClick={() => navigate("/auth/login", { state: { toast: "로그인이 필요합니다" }, replace: true })}
                >
                  로그인하기
                </Button>
              )}
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <span className="empty-text">
                {hasAppliedSearch(appliedTitle, appliedRgtrId, appliedRgtrName)
                  ? "검색 결과가 없습니다."
                  : "등록된 게시글이 없습니다."}
              </span>
            </div>
          ) : (
            <>
              <table className="table board-page__table-desktop">
                <thead>
                  <tr>
                    <th className="th th-number">
                      <span className="board-th-sort-wrap board-th-sort-wrap--center">
                        <span className="board-th-sort-label">번호</span>
                        <BoardSortHeaderButton
                          ariaLabel="글 번호 기준 정렬"
                          onClick={() => handleHeaderSort("postNumber")}
                        />
                      </span>
                    </th>
                    <th className="th th-title">
                      <span className="board-th-sort-wrap">
                        <span className="board-th-sort-label">제목</span>
                        <BoardSortHeaderButton
                          ariaLabel="제목 기준 정렬"
                          onClick={() => handleHeaderSort("title")}
                        />
                      </span>
                    </th>
                    <th className="th th-rgtr">
                      <span className="board-th-sort-wrap">
                        <span className="board-th-sort-label">등록자</span>
                        <BoardSortHeaderButton
                          ariaLabel="등록자 이름 기준 정렬"
                          onClick={() => handleHeaderSort("rgtrName")}
                        />
                      </span>
                    </th>
                    <th className="th th-view">
                      <span className="board-th-sort-wrap board-th-sort-wrap--center">
                        <span className="board-th-sort-label">조회</span>
                        <BoardSortHeaderButton
                          ariaLabel="조회수 기준 정렬"
                          onClick={() => handleHeaderSort("inqCnt")}
                        />
                      </span>
                    </th>
                    <th className="th th-date">
                      <span className="board-th-sort-wrap board-th-sort-wrap--center">
                        <span className="board-th-sort-label">등록일시</span>
                        <BoardSortHeaderButton
                          ariaLabel="등록일 기준 정렬"
                          onClick={() => handleHeaderSort("regDt")}
                        />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr
                      key={post.postNumber}
                      className="tr tr-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => openPostDetail(post.postNumber)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openPostDetail(post.postNumber);
                        }
                      }}
                    >
                      <td className="td td-number">{post.postNumber}</td>
                      <td className="td td-title">
                        <Tooltip content={post.title} onlyWhenTruncated>
                          <span className="list-title-text">{post.title}</span>
                        </Tooltip>
                      </td>
                      <td className="td td-rgtr">{post.rgtrInfo ?? "-"}</td>
                      <td className="td td-view">{post.inqCnt ?? 0}</td>
                      <td className="td td-date">{post.regDt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <ul className="post-list-cards" aria-label="게시글 목록">
                {posts.map((post) => (
                  <li
                    key={`card-${post.postNumber}`}
                    className="post-list-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => openPostDetail(post.postNumber)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openPostDetail(post.postNumber);
                      }
                    }}
                  >
                    <div className="post-list-card__head">
                      <span className="post-list-card__number">{post.postNumber}</span>
                      <span className="post-list-card__title">{post.title}</span>
                    </div>
                    <dl className="post-list-card__meta">
                      <div className="post-list-card__row">
                        <dt>등록자</dt>
                        <dd>{post.rgtrInfo ?? "-"}</dd>
                      </div>
                      <div className="post-list-card__row">
                        <dt>조회</dt>
                        <dd>{post.inqCnt ?? 0}</dd>
                      </div>
                      <div className="post-list-card__row">
                        <dt>등록일시</dt>
                        <dd className="post-list-card__date">{post.regDt}</dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
