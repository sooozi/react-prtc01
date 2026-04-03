import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPostDetail, deletePost, BoardApiError, viewCountUp } from "@/api/board";
import type { PostDetail } from "@/api/board";
import { Badge, Button, Confirm, LoadingState } from "@/components";
import "@/pages/post/Detail.scss";

export default function Detail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const idRaw = searchParams.get("id");
  const postNumber = idRaw ? parseInt(idRaw, 10) : NaN;
  const invalidId = Number.isNaN(postNumber) || postNumber < 1;


  // [게시글 상세 조회]
  useEffect(() => {
    if (invalidId) return;

    let cancelled = false;

    // 1) 조회수 증가 먼저 호출 후, 2) 상세 조회 (둘 다 서버 값 사용해 목록·상세 조회수 일치)
    (async () => {
      // 조회수 증가
      try {
        await viewCountUp(postNumber);
      } catch (e) {
        if (import.meta.env.DEV) console.warn("조회수 증가 API 실패:", e);
      }
      // 조회수 증가 실패 시 취소 플래그 확인
      if (cancelled) return;

      // 게시글 상세 조회
      try {
        const data = await getPostDetail(postNumber);
        if (!cancelled) setPost(data);
      } catch (e: unknown) {
        if (cancelled) return;
        // 게시글 상세 조회 실패 시 에러 처리
        if (e instanceof BoardApiError && e.status === 401) {
          setError(e.message);
          setIsUnauthorized(true);
        } else {
          setError(e instanceof Error ? e.message : "게시글을 불러오지 못했습니다.");
        }
      } finally {
        // 게시글 상세 조회 완료 시 로딩 상태 초기화
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [postNumber, invalidId]);

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

  // [삭제 버튼 클릭 시] 컨펌 후 게시글 삭제
  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    setDeleteLoading(true);
    try {
      await deletePost(postNumber);
      navigate("/post/list?page=1", { replace: true });
    } catch (e) {
      if (e instanceof BoardApiError && e.status === 401) {
        navigate("/auth/login", { state: { toast: e.message }, replace: true });
      } else {
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
        <Badge>📄 Detail</Badge>
        <h1 className="title">게시글 상세</h1>
      </div>

      <div className="post-detail-actions">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/post/list")}
          disabled={deleteLoading}
        >
          목록
        </Button>
        {canEdit && (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/post/update?id=${postNumber}`)}
              disabled={deleteLoading}
            >
              수정
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleteLoading}
            >
              {deleteLoading ? "삭제 중..." : "삭제"}
            </Button>
          </>
        )}
      </div>

      {/* 게시글 상세 콘텐츠 */}
      <div className="post-detail-card">
        {/* 로딩 상태 표시 */}
        {showLoading ? (
          <LoadingState message="불러오는 중..." variant="compact" />
        ) : showErrorSection ? (
          <div className="detail-error">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{displayError}</span>
            {isUnauthorized && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/auth/login")}
              >
                로그인하기
              </Button>
            )}
          </div>
        ) : post ? (
          <>
            <div className="detail-meta">
              <span className="detail-id">#{post.postNumber}</span>
              <span className="detail-author">{post.rgtrInfo ?? "-"}</span>
              <span className="detail-date">{post.regDt}</span>
              <span className="detail-view">조회 {post.inqCnt ?? 0}</span>
            </div>
            <h2 className="detail-title">{post.title}</h2>
            <div className="detail-content">{post.content || "내용 없음"}</div>
          </>
        ) : null}
      </div>

      <Confirm
        open={showDeleteConfirm}
        message="삭제하시겠습니까?"
        variant="danger"
        confirmLabel="삭제"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
