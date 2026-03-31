import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { selectBoardList, BoardApiError } from "@/api/board";
import type { PostDto, SortOrder } from "@/api/board";
import { Badge, Button, LoadingState, Pagination, Tooltip } from "@/components";
import { usePagination } from "@/hooks/usePagination";
import { URL_PAGE_QUERY_KEY, useUrlQueryPage } from "@/hooks/useUrlQueryPage";
import "@/pages/post/List.scss";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "regDt", label: "최신순" },
  { value: "title", label: "제목순" },
  { value: "inqCnt", label: "조회순" },
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

export default function List() {
  const navigate = useNavigate();
  const { currentPage, setCurrentPage, searchParams, setSearchParams } = useUrlQueryPage();
  const [posts, setPosts] = useState<PostDto[]>([]);
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

  /** 검색 확정: 입력값을 applied로 복사하고 1페이지로 이동 (주소에는 검색어 안 붙음) */
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

        // 게시글 목록 조회
        const res = await selectBoardList({
          page: currentPage,
          size: pageSize,
          sortColumnName: sort,
          sortType: order,
          titleSearchKeyword: appliedTitle || undefined,
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
                    <th className="th th-number">번호</th>
                    <th className="th th-title">제목</th>
                    <th className="th">등록자</th>
                    <th className="th th-view">조회</th>
                    <th className="th th-date">등록일시</th>
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
                      <td className="td">{post.rgtrInfo ?? "-"}</td>
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
