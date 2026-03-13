import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPostDetail, updatePost, BoardApiError } from "@/api/boardApi";
import type { PostDetailItem } from "@/api/boardApi";
import "@/pages/post/Detail.scss";
import "@/pages/post/Update.scss";

export default function Update() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idRaw = searchParams.get("id");
  const postNumber = idRaw ? parseInt(idRaw, 10) : NaN;
  const invalidId = Number.isNaN(postNumber) || postNumber < 1;

  const [post, setPost] = useState<PostDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 상세 조회 후 폼 초기화
  useEffect(() => {
    // 게시글 번호가 유효하지 않으면 조회하지 않음
    if (invalidId) {
      setLoading(false);
      return;
    }

    // 로그인 토큰 확인
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      navigate("/auth/login", { state: { toast: "로그인이 필요합니다" }, replace: true });
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

  // [저장 버튼 클릭 시] 게시글 수정(api에 요청 보내기)
  const handleSave = async () => {
    if (!window.confirm("저장하시겠습니까?")) return;
    // 제목이 비어있으면 에러 메시지 설정
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    setError("");
    setSubmitLoading(true);
    try {
      // 게시글 수정(api에 요청 보내기)
      await updatePost(postNumber, { title: title.trim(), content: content.trim() });
      navigate(`/post/detail?id=${postNumber}`, { replace: true });
    } catch (e) {
      // 게시글 수정 실패 시 에러 처리
      if (e instanceof BoardApiError && e.status === 401) {
        navigate("/auth/login", { state: { toast: e.message }, replace: true });
      } else {
        setError(e instanceof Error ? e.message : "수정에 실패했습니다.");
      }
    } finally {
      // 게시글 수정 완료 시 제출 로딩 상태 초기화
      setSubmitLoading(false);
    }
  };

  // [취소 버튼 클릭 시] 게시글 상세 페이지로 이동
  const handleCancel = () => {
    if (!window.confirm("취소하시겠습니까?")) return;
    navigate(`/post/detail?id=${postNumber}`, { replace: true });
  };

  // 로딩 상태 확인
  const showLoading = loading && !invalidId;
  // 에러 메시지 확인
  const showErrorSection = invalidId || error;

  return (
    <div className="post-detail-page">
      <div className="post-detail-header">
        <span className="badge">✏️ Edit</span>
        <h1 className="title">게시글 수정</h1>
      </div>
      <div className="post-detail-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={handleCancel}
          disabled={submitLoading}
        >
          취소
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={handleSave}
          disabled={submitLoading || loading}
        >
          {submitLoading ? "저장 중..." : "저장"}
        </button>
      </div>
      <div className="post-detail-card">
        {showLoading ? (
          <div className="detail-loading">
            <div className="spinner" />
            <span>불러오는 중...</span>
          </div>
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
              <span className="detail-id">#{post.id}</span>
              <span className="detail-author">{post.author}</span>
              <span className="detail-date">{post.createdAt}</span>
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
    </div>
  );
}
