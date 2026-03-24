import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { selectBoardList, BoardApiError } from "@/api/boardApi";
import type { BoardPostItem, SortOrder } from "@/api/boardApi";
import { Badge, Button, LoadingState, Pagination, Tooltip } from "@/components";
import { usePagination } from "@/hooks/usePagination";
import "@/pages/post/List.scss";

const PAGE_PARAM = "page";
const SORT_PARAM = "sort";
const ORDER_PARAM = "order";
// GET /posts 쿼리와 매핑: titleSearchKeyword 등
const TITLE_PARAM = "title";
const RGTR_ID_PARAM = "rgtrId";
const RGTR_NAME_PARAM = "rgtrName";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "regDt", label: "최신순" },
  { value: "title", label: "제목순" },
  { value: "inqCnt", label: "조회순" },
];

const ORDER_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "DESC", label: "내림차순" },
  { value: "ASC", label: "오름차순" },
];

// URL searchParams에서 현재 페이지 번호 추출 (없거나 잘못되면 1)
function getPageFromSearchParams(searchParams: URLSearchParams): number {
  const raw = searchParams.get(PAGE_PARAM);
  const n = parseInt(raw ?? "1", 10);
  if (Number.isNaN(n) || n < 1) return 1;
  return n;
}

// URL에서 정렬 컬럼 (기본: regDt)
function getSortFromSearchParams(searchParams: URLSearchParams): string {
  const v = searchParams.get(SORT_PARAM);
  // 정렬 컬럼이 SORT_OPTIONS에 있는지 확인
  return v && SORT_OPTIONS.some((o) => o.value === v) ? v : "regDt";
}

// URL에서 정렬 타입 (기본: DESC)
function getOrderFromSearchParams(searchParams: URLSearchParams): SortOrder {
  const v = searchParams.get(ORDER_PARAM);
  return v === "ASC" || v === "DESC" ? v : "DESC";
}

// 검색 조건이 있는지 확인
function hasActiveSearch(searchParams: URLSearchParams): boolean {
  return Boolean(
    searchParams.get(TITLE_PARAM)?.trim() ||
      searchParams.get(RGTR_ID_PARAM)?.trim() ||
      searchParams.get(RGTR_NAME_PARAM)?.trim()
  );
}

export default function List() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BoardPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const currentPage = getPageFromSearchParams(searchParams);
  const sort = getSortFromSearchParams(searchParams);
  const order = getOrderFromSearchParams(searchParams);
  const titleFromUrl = searchParams.get(TITLE_PARAM) ?? "";
  const rgtrIdFromUrl = searchParams.get(RGTR_ID_PARAM) ?? "";
  const rgtrNameFromUrl = searchParams.get(RGTR_NAME_PARAM) ?? "";

  /** URL에 반영되기 전 입력값; 제출 시에만 URL로 올라감 */
  const [draftTitle, setDraftTitle] = useState(titleFromUrl);
  const [draftRgtrId, setDraftRgtrId] = useState(rgtrIdFromUrl);
  const [draftRgtrName, setDraftRgtrName] = useState(rgtrNameFromUrl);

  useEffect(() => {
    setDraftTitle(titleFromUrl);
    setDraftRgtrId(rgtrIdFromUrl);
    setDraftRgtrName(rgtrNameFromUrl);
  }, [titleFromUrl, rgtrIdFromUrl, rgtrNameFromUrl]);

  const { totalItems, setTotalItems, totalPages, pageSize } = usePagination();

  const setCurrentPage = useCallback(
    (page: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set(PAGE_PARAM, String(page));
        return next;
      });
    },
    [setSearchParams]
  );

  const openPostDetail = useCallback(
    (id: number) => {
      navigate(`/post/detail?id=${id}`);
    },
    [navigate]
  );

  // 정렬 변경: 검색·페이지 외 쿼리는 유지
  const handleSortChange = (newSort: string, newOrder: SortOrder) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set(PAGE_PARAM, "1");
      next.set(SORT_PARAM, newSort);
      next.set(ORDER_PARAM, newOrder);
      return next;
    });
  };

  const applySearchToUrl = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set(PAGE_PARAM, "1");
      const t = draftTitle.trim();
      const id = draftRgtrId.trim();
      const name = draftRgtrName.trim();
      if (t) next.set(TITLE_PARAM, t);
      else next.delete(TITLE_PARAM);
      if (id) next.set(RGTR_ID_PARAM, id);
      else next.delete(RGTR_ID_PARAM);
      if (name) next.set(RGTR_NAME_PARAM, name);
      else next.delete(RGTR_NAME_PARAM);
      return next;
    });
  };

  const clearSearchFromUrl = () => {
    setDraftTitle("");
    setDraftRgtrId("");
    setDraftRgtrName("");
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set(PAGE_PARAM, "1");
      next.delete(TITLE_PARAM);
      next.delete(RGTR_ID_PARAM);
      next.delete(RGTR_NAME_PARAM);
      return next;
    });
  };

  // 현재 페이지 번호 유효성 검사
  useEffect(() => {
    const raw = searchParams.get(PAGE_PARAM);
    const num = raw !== null ? parseInt(raw, 10) : NaN;
    const isValid = !Number.isNaN(num) && num >= 1;
    if (!isValid) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set(PAGE_PARAM, "1");
        return next;
      });
    }
  }, [searchParams, setSearchParams]);

  // 게시글 목록 조회
  useEffect(() => {
    // 로그인 토큰 확인
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      navigate("/auth/login", { state: { toast: "로그인이 필요합니다" }, replace: true });
      return;
    }

    // 게시글 목록 조회
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        setIsUnauthorized(false);

        const res = await selectBoardList({
          page: currentPage,
          size: pageSize,
          sortColumnName: sort,
          sortType: order,
          titleSearchKeyword: titleFromUrl || undefined,
          rgtrIdSearchKeyword: rgtrIdFromUrl || undefined,
          rgtrNameSearchKeyword: rgtrNameFromUrl || undefined,
        });

        // 응답 데이터 파싱
        const payload = res?.data;

        setPosts(payload?.data ?? []);
        const total = payload?.totalItemSize ?? 0;
        // 전체 게시글 수 설정
        setTotalItems(total);

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
    titleFromUrl,
    rgtrIdFromUrl,
    rgtrNameFromUrl,
    setCurrentPage,
    setTotalItems,
    navigate,
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
        <form
          className="board-search-bar"
          onSubmit={(e) => {
            e.preventDefault();
            applySearchToUrl();
          }}
        >
          <div className="board-search-fields">
            <label className="board-search-label">
              제목
              <input
                type="search"
                className="board-search-input"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="제목 키워드"
                autoComplete="off"
              />
            </label>
            <label className="board-search-label">
              등록자 ID
              <input
                type="search"
                className="board-search-input"
                value={draftRgtrId}
                onChange={(e) => setDraftRgtrId(e.target.value)}
                placeholder="rgtr ID"
                autoComplete="off"
              />
            </label>
            <label className="board-search-label">
              등록자 이름
              <input
                type="search"
                className="board-search-input"
                value={draftRgtrName}
                onChange={(e) => setDraftRgtrName(e.target.value)}
                placeholder="이름"
                autoComplete="off"
              />
            </label>
          </div>
          <div className="board-search-actions">
            <Button type="submit" variant="secondary" size="sm">
              검색
            </Button>
            <Button
              type="button"
              variant="outlinePrimary"
              size="sm"
              onClick={clearSearchFromUrl}
              disabled={!hasActiveSearch(searchParams) && !draftTitle.trim() && !draftRgtrId.trim() && !draftRgtrName.trim()}
            >
              초기화
            </Button>
          </div>
        </form>

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
                {hasActiveSearch(searchParams)
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
                      key={post.id}
                      className="tr tr-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => openPostDetail(post.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openPostDetail(post.id);
                        }
                      }}
                    >
                      <td className="td td-number">{post.id}</td>
                      <td className="td td-title">
                        <Tooltip content={post.title} onlyWhenTruncated>
                          <span className="list-title-text">{post.title}</span>
                        </Tooltip>
                      </td>
                      <td className="td">{post.author}</td>
                      <td className="td td-view">{post.viewCount ?? 0}</td>
                      <td className="td td-date">{post.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <ul className="post-list-cards" aria-label="게시글 목록">
                {posts.map((post) => (
                  <li
                    key={`card-${post.id}`}
                    className="post-list-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => openPostDetail(post.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openPostDetail(post.id);
                      }
                    }}
                  >
                    <div className="post-list-card__head">
                      <span className="post-list-card__number">{post.id}</span>
                      <span className="post-list-card__title">{post.title}</span>
                    </div>
                    <dl className="post-list-card__meta">
                      <div className="post-list-card__row">
                        <dt>등록자</dt>
                        <dd>{post.author}</dd>
                      </div>
                      <div className="post-list-card__row">
                        <dt>조회</dt>
                        <dd>{post.viewCount ?? 0}</dd>
                      </div>
                      <div className="post-list-card__row">
                        <dt>등록일시</dt>
                        <dd className="post-list-card__date">{post.createdAt}</dd>
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
