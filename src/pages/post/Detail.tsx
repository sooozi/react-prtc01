import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPostDetail, deletePost, BoardApiError } from "@/api/boardApi";
import type { PostDetailItem } from "@/api/boardApi";
import "./Detail.scss";

export default function Detail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [post, setPost] = useState<PostDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const idRaw = searchParams.get("id");
  const postNumber = idRaw ? parseInt(idRaw, 10) : NaN;
  const invalidId = Number.isNaN(postNumber) || postNumber < 1;


  // [게시글 상세 조회]
  useEffect(() => {
    if (invalidId) return; // 게시글 번호가 유효하지 않으면 조회하지 않음

    // 로그인 토큰 확인
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      navigate("/auth/login", { state: { toast: "로그인이 필요합니다" }, replace: true });
      return;
    }

    // 게시글 상세 조회(api에 요청 보내기)
    getPostDetail(postNumber)
      .then((data) => {
        setPost(data);
      })
      .catch((e: unknown) => {
        if (e instanceof BoardApiError && e.status === 401) {
          setError(e.message);
          setIsUnauthorized(true);
        } else {
          setError(e instanceof Error ? e.message : "게시글을 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [postNumber, invalidId, navigate]);

  // 로딩 상태 확인
  const showLoading = loading && !invalidId;
  // 에러 메시지 확인
  const displayError = invalidId ? "잘못된 게시글 번호입니다." : error;
  // 에러 섹션 확인
  const showErrorSection = invalidId || error;


  // [수정 버튼 노출] 해당 포스트 작성자와 로그인 사용자가 같을 때
  const currentUserId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  // 게시글, 로그인, 작성자와 사용자가 동일한 경우 수정 버튼 노출(boolean)
  const canEdit =
    !!post && !!currentUserId && post.ownerUserId === currentUserId;

  // [삭제 버튼 클릭 시] 게시글 삭제 후 목록 첫 페이지로 이동
  const handleDelete = async () => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    setDeleteLoading(true);
    try {
      await deletePost(postNumber);
      navigate("/post/list?page=1", { replace: true });
    } catch (e) {
      // 삭제 시점에 요청이 깨진 경우
      if (e instanceof BoardApiError && e.status === 401) {
        navigate("/auth/login", { state: { toast: e.message }, replace: true });
      } else {
        // 다른 오류 처리
        setError(e instanceof Error ? e.message : "삭제에 실패했습니다.");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // 게시글 상세 페이지 렌더링
  return (
    <div className="post-detail-page">
      {/* 게시글 상세 헤더 */}
      <div className="post-detail-header">
        <span className="badge">📄 Detail</span>
        <h1 className="title">게시글 상세</h1>
      </div>

      <div className="post-detail-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate("/post/list")}
          disabled={deleteLoading}
        >
          목록
        </button>
        {canEdit && (
          <>
            <button
              type="button"
              className="primary-button"
              onClick={() => navigate(`/post/update?id=${postNumber}`)}
              disabled={deleteLoading}
            >
              수정
            </button>
            <button
              type="button"
              className="danger-button"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "삭제 중..." : "삭제"}
            </button>
          </>
        )}
      </div>

      {/* 게시글 상세 카드 */}
      <div className="post-detail-card">
        {/* 로딩 상태 표시 */}
        {showLoading ? (
          <div className="detail-loading">
            <div className="spinner" />
            <span>불러오는 중...</span>
          </div>
        ) : showErrorSection ? (
          <div className="detail-error">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{displayError}</span>
            {isUnauthorized && (
              <button
                type="button"
                className="detail-login-btn"
                onClick={() => navigate("/auth/login")}
              >
                로그인하기
              </button>
            )}
          </div>
        ) : post ? (
          <>
            <div className="detail-meta">
              <span className="detail-id">#{post.id}</span>
              <span className="detail-author">{post.author}</span>
              <span className="detail-date">{post.createdAt}</span>
            </div>
            <h2 className="detail-title">{post.title}</h2>
            <div className="detail-content">{post.content || "내용 없음"}</div>
          </>
        ) : null}
      </div>
    </div>
  );
}
