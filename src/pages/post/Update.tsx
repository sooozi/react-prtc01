import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPostDetail, updatePost, BoardApiError } from "@/api/board";
import type { PostDetail } from "@/api/board";
import { Badge, Button, Confirm, LoadingState } from "@/components";
import { postDetailPath } from "@/pages/post/postDetailFromQuery";
import "@/pages/post/Detail.scss";
import "@/pages/post/Update.scss";

export default function Update() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idRaw = searchParams.get("id");
  const postNumber = idRaw ? parseInt(idRaw, 10) : NaN;
  const invalidId = Number.isNaN(postNumber) || postNumber < 1;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // 상세 조회 후 폼 초기화(서버에서 가져온 글 노출)
  useEffect(() => {
    // 게시글 번호가 유효하지 않으면 조회하지 않음
    if (invalidId) {
      setLoading(false);
      return;
    }

    // 게시글 상세 조회(api에 요청 보내기)
    getPostDetail(postNumber)
      // 게시글 상세 조회 성공 시 폼 초기화
      .then((data) => {
        setPost(data);
        setTitle(data.title);
        setContent(data.content ?? "");
      })
      // 게시글 상세 조회 실패 시 에러 처리
      .catch((e: unknown) => {
        if (e instanceof BoardApiError && e.status === 401) {
          navigate("/auth/login", { state: { toast: e.message }, replace: true });
        } else {
          setError(e instanceof Error ? e.message : "게시글을 불러오지 못했습니다.");
        }
      })
      // 게시글 상세 조회 완료 시 로딩 상태 초기화
      .finally(() => setLoading(false));
  }, [postNumber, invalidId, navigate]);

  // [저장 버튼 클릭 시] 컨펌 후 게시글 수정
  const handleSaveConfirm = async () => {
    setShowSaveConfirm(false);
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }
    setError("");
    setSubmitLoading(true);
    // [게시글 수정]
    try {
      await updatePost(postNumber, {
        title: title.trim(),
        content: content.trim(),
      });
      navigate(postDetailPath(postNumber, searchParams.get("from")), { replace: true });
    } catch (e) {
      if (e instanceof BoardApiError && e.status === 401) {
        navigate("/auth/login", { state: { toast: e.message }, replace: true });
      } else {
        setError(e instanceof Error ? e.message : "수정에 실패했습니다.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // [취소 버튼 클릭 시] 컨펌 후 상세로 이동
  const handleCancelConfirm = () => {
    setShowCancelConfirm(false);
    navigate(postDetailPath(postNumber, searchParams.get("from")), { replace: true });
  };

  // 로딩 상태 확인
  const showLoading = loading && !invalidId;
  // 에러 메시지 확인
  const showErrorSection = invalidId || error;

  return (
    <div className="post-detail-page">
      <div className="post-detail-header">
        <Badge>✏️ Edit</Badge>
        <h1 className="title">게시글 수정</h1>
      </div>
      <div className="post-detail-actions">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowCancelConfirm(true)}
          disabled={submitLoading}
        >
          취소
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowSaveConfirm(true)}
          disabled={submitLoading || loading}
        >
          {submitLoading ? "저장 중..." : "저장"}
        </Button>
      </div>
      <div className="post-detail-card">
        {showLoading ? (
          <LoadingState message="불러오는 중..." variant="compact" />
        ) : showErrorSection ? (
          <div className="detail-error">
            <span className="error-icon">⚠️</span>
            <span className="error-message">
              {invalidId ? "잘못된 게시글 번호입니다." : error}
            </span>
          </div>
        ) : post ? (
          <div className="post-update-form">
            <div className="detail-meta">
              <span className="detail-id">#{post.postNumber}</span>
              <span className="detail-author">{post.rgtrInfo ?? "-"}</span>
              <span className="detail-date">{post.regDt}</span>
            </div>
            <div className="post-update-form-group">
              <label className="post-update-label" htmlFor="update-title">
                제목
              </label>
              <input
                id="update-title"
                type="text"
                className="post-update-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목"
              />
            </div>
            <div className="post-update-form-group">
              <label className="post-update-label" htmlFor="update-content">
                내용
              </label>
              <textarea
                id="update-content"
                className="post-update-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용"
                rows={12}
              />
            </div>
            {error && (
              <div className="post-update-error" role="alert">
                {error}
              </div>
            )}
          </div>
        ) : null}
      </div>

      <Confirm
        open={showSaveConfirm}
        message="저장하시겠습니까?"
        onConfirm={handleSaveConfirm}
        onCancel={() => setShowSaveConfirm(false)}
      />
      <Confirm
        open={showCancelConfirm}
        message="취소하시겠습니까?"
        onConfirm={handleCancelConfirm}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </div>
  );
}
