import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { selectBoardList, BoardApiError } from "@/api/boardApi";
import type { BoardPostItem } from "@/api/boardApi";
import { Badge, Button, LoadingState, Pagination, Tooltip } from "@/components";
import { usePagination } from "@/hooks/usePagination";
import "@/pages/post/List.scss";

const PAGE_PARAM = "page";

/** URL searchParams에서 현재 페이지 번호 추출 (없거나 잘못되면 1) */
function getPageFromSearchParams(searchParams: URLSearchParams): number {
  const raw = searchParams.get(PAGE_PARAM);
  const n = parseInt(raw ?? "1", 10);
  if (Number.isNaN(n) || n < 1) return 1;
  return n;
}

export default function List() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BoardPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  // 현재 페이지 번호 추출(현재 페이지 번호는 url에서만 정함!)
  const currentPage = getPageFromSearchParams(searchParams);
  const { totalItems, setTotalItems, totalPages, pageSize } = usePagination();

  // 페이지 번호 변경 핸들러
  const setCurrentPage = useCallback(
    (page: number) => {
      // URL 파라미터 업데이트
      setSearchParams({ [PAGE_PARAM]: String(page) });
    },
    [setSearchParams] // setSearchParams 함수 의존성 배열
  );

  // URL의 page가 없거나 유효하지 않으면(음수, 0, NaN) page=1로 정리
  useEffect(() => {
    const raw = searchParams.get(PAGE_PARAM);
    const num = raw !== null ? parseInt(raw, 10) : NaN; // 문자열을 10진수로 파싱
    const isValid = !Number.isNaN(num) && num >= 1; // 숫자가 아니거나 1보다 작으면 false
    if (!isValid) { // 유효하지 않으면 page=1로 설정
      setSearchParams({ [PAGE_PARAM]: "1" });
    }
  }, [searchParams, setSearchParams]);

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

        // 게시글 목록 조회(api에 요청 보내기)
        const res = await selectBoardList({
          page: currentPage,
          size: pageSize,
        });

        // 응답 데이터 파싱
        const payload = res?.data;

        // 게시글 목록 설정
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
    fetchData(); // selectBoardList 호출하는 부분
  }, [currentPage, pageSize, setCurrentPage, setTotalItems, navigate]);

  return (
    <div className="board-page">
      <div className="title-section">
        <div className="title-block">
          <Badge>📋 Board</Badge>
          <h1 className="title">게시판</h1>
          <p className="subtitle">
            전체 <strong>{totalItems}</strong>개의 게시글
          </p>
        </div>
      </div>

      <div className="board-write-btn-container">
        <div className="board-write-btn-block">
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
              <span className="empty-text">등록된 게시글이 없습니다.</span>
            </div>
          ) : (
            <table className="table">
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
                    onClick={() => navigate(`/post/detail?id=${post.id}`)}
                    // 키보드 접근성을 위한 이벤트 핸들러
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/post/detail?id=${post.id}`);
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
