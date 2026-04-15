import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPostDetail, getPostFiles, updatePost, BoardApiError } from "@/api/board";
import type { PostAttachmentItem, PostDetail } from "@/api/board";
import { Badge, Button, Confirm, LoadingState } from "@/components";
import { postDetailPath } from "@/pages/post/postDetailFromQuery";
import "@/pages/post/Detail.scss";
import "@/pages/post/Write.scss";
import "@/pages/post/Update.scss";

export default function Update() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idRaw = searchParams.get("id");
  const postNumber = idRaw ? parseInt(idRaw, 10) : NaN;
  const invalidId = Number.isNaN(postNumber) || postNumber < 1;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [existingAttachments, setExistingAttachments] = useState<PostAttachmentItem[]>([]);
  const [newAttachFiles, setNewAttachFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachDragCounter = useRef(0);
  const [isAttachDragging, setIsAttachDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const newAttachPreviewUrls = useMemo(
    () => newAttachFiles.map((file) => URL.createObjectURL(file)),
    [newAttachFiles]
  );

  useEffect(() => {
    return () => {
      newAttachPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newAttachPreviewUrls]);

  const removeNewAttachAt = (index: number) => {
    setNewAttachFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0 && fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return next;
    });
  };

  const addImageFiles = (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return;
    setNewAttachFiles((prev) => [...prev, ...images]);
  };

  const handleAttachFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (list?.length) {
      addImageFiles(Array.from(list));
      e.target.value = "";
    }
  };

  const handleAttachDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    attachDragCounter.current += 1;
    setIsAttachDragging(true);
  };

  const handleAttachDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    attachDragCounter.current -= 1;
    if (attachDragCounter.current <= 0) {
      attachDragCounter.current = 0;
      setIsAttachDragging(false);
    }
  };

  const handleAttachDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleAttachDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    attachDragCounter.current = 0;
    setIsAttachDragging(false);
    addImageFiles(Array.from(e.dataTransfer.files));
  };

  // 상세 + 기존 첨부 목록
  useEffect(() => {
    if (invalidId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const [data, files] = await Promise.all([
          getPostDetail(postNumber),
          getPostFiles(postNumber).catch(() => [] as PostAttachmentItem[]),
        ]);
        if (cancelled) return;
        setPost(data);
        setTitle(data.title);
        setContent(data.content ?? "");
        setExistingAttachments([...files].sort((a, b) => a.sortOrder - b.sortOrder));
      } catch (e: unknown) {
        if (cancelled) return;
        if (e instanceof BoardApiError && e.status === 401) {
          navigate("/auth/login", { state: { toast: e.message }, replace: true });
        } else {
          setError(e instanceof Error ? e.message : "게시글을 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [postNumber, invalidId, navigate]);

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
    try {
      await updatePost(postNumber, {
        title: title.trim(),
        content: content.trim(),
        attachFiles: newAttachFiles.length > 0 ? newAttachFiles : undefined,
      });
      navigate(postDetailPath(postNumber, searchParams.get("from")), { replace: true });
    } catch (e) {
      if (e instanceof BoardApiError && e.status === 401) {
        navigate("/auth/login", { state: { toast: e.message }, replace: true });
      } else if (e instanceof BoardApiError) {
        const detail = e.resultDetailMessage ? ` ${e.resultDetailMessage}` : "";
        setError(`${e.message}${detail}`.trim());
      } else {
        setError(e instanceof Error ? e.message : "수정에 실패했습니다.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancelConfirm = () => {
    setShowCancelConfirm(false);
    navigate(postDetailPath(postNumber, searchParams.get("from")), { replace: true });
  };

  const showLoading = loading && !invalidId;
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

            <div className="form-group">
              <span className="label" id="update-file-label">
                첨부파일
              </span>
              <div className="board-write-file-upload">
                <input
                  ref={fileInputRef}
                  id="update-post-file"
                  type="file"
                  className="board-write-file-input-hidden"
                  accept="image/*"
                  multiple
                  aria-labelledby="update-file-label"
                  aria-describedby="update-file-hint"
                  onChange={handleAttachFileChange}
                />
                <label
                  htmlFor="update-post-file"
                  className={
                    isAttachDragging
                      ? "board-write-file-drop board-write-file-drop--dragging"
                      : "board-write-file-drop"
                  }
                  onDragEnter={handleAttachDragEnter}
                  onDragLeave={handleAttachDragLeave}
                  onDragOver={handleAttachDragOver}
                  onDrop={handleAttachDrop}
                >
                  <span className="board-write-file-drop__icon" aria-hidden>
                    <svg width="35" height="35" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M4 16.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2.5M8 9l4-4 4 4M12 5v11"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="board-write-file-drop__title">이미지 선택 또는 드롭</span>
                  <span className="board-write-file-drop__sub">PNG, JPG, GIF, WebP 등</span>
                </label>
              </div>
              {(existingAttachments.length > 0 || newAttachFiles.length > 0) && (
                <ul className="board-write-attach-previews" aria-label="첨부파일">
                  {existingAttachments.map((f) => (
                    <li
                      key={`existing-${f.fileId}`}
                      className="board-write-attach-preview board-write-attach-preview--saved"
                    >
                      <div className="board-write-attach-preview__saved-thumb" aria-hidden>
                        📎
                      </div>
                      <span className="board-write-attach-preview__name">{f.fileName}</span>
                    </li>
                  ))}
                  {newAttachFiles.map((file, index) => (
                    <li
                      key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                      className="board-write-attach-preview"
                    >
                      <img
                        src={newAttachPreviewUrls[index]}
                        alt=""
                        className="board-write-attach-preview__img"
                      />
                      <span className="board-write-attach-preview__name">{file.name}</span>
                      <button
                        type="button"
                        className="board-write-attach-preview__remove"
                        onClick={() => removeNewAttachAt(index)}
                        aria-label={`${file.name} 첨부 제거`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
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
