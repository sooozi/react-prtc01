import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost, BoardApiError } from "@/api/board";
import { Badge, Button } from "@/components";
import "@/pages/post/Write.scss";

export default function Write() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachFiles, setAttachFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachDragCounter = useRef(0);
  const [isAttachDragging, setIsAttachDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 첨부파일 미리보기 URL 목록
  const attachPreviewUrls = useMemo(
    () => attachFiles.map((file) => URL.createObjectURL(file)),
    [attachFiles]
  );

  useEffect(() => {
    return () => {
      attachPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [attachPreviewUrls]);

  // 첨부파일 제거
  const removeAttachAt = (index: number) => {
    setAttachFiles((prev) => {
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
    setAttachFiles((prev) => [...prev, ...images]);
  };

  const handleAttachFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    setAttachFiles(list ? Array.from(list) : []);
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
    const dropped = Array.from(e.dataTransfer.files);
    addImageFiles(dropped);
  };

  // 등록 버튼 클릭 시 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      await createPost({
        title: title.trim(),
        content: content.trim(),
        attachFiles: attachFiles.length > 0 ? attachFiles : undefined,
      });
      navigate("/post/list", { replace: true });
    } catch (e) {
      // 인증 오류 처리
      if (e instanceof BoardApiError && e.status === 401) {
        navigate("/auth/login", { state: { toast: e.message }, replace: true });
      } else if (e instanceof BoardApiError) {
        const detail = e.resultDetailMessage
          ? ` ${e.resultDetailMessage}`
          : "";
        setError(`${e.message}${detail}`.trim());
      } else {
        setError(e instanceof Error ? e.message : "등록에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="board-write-page">
      <div className="board-write-header">
        <Badge>✏️ 글쓰기</Badge>
        <h1 className="title">게시글 등록</h1>
        <p className="subtitle">제목과 내용을 입력한 뒤 등록해주세요.</p>
      </div>

      <form className="board-write-form" onSubmit={handleSubmit}>
        {error && (
          <div className="board-write-error" role="alert">
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="label" htmlFor="post-title">
            제목
          </label>
          <input
            id="post-title"
            type="text"
            className="input"
            placeholder="제목을 입력하세요 (100자 이내)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label className="label" htmlFor="post-content">
            내용
          </label>
          <textarea
            id="post-content"
            className="input textarea"
            placeholder="내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
          />
        </div>

        <div className="form-group">
          <span className="label" id="post-file-label">
            첨부파일
          </span>
          <p className="board-write-file-hint" id="post-file-hint">
            이미지 파일을 선택하거나 여기로 끌어다 놓을 수 있어요.
          </p>
          <div className="board-write-file-upload">
            <input
              ref={fileInputRef}
              id="post-file"
              type="file"
              className="board-write-file-input-hidden"
              accept="image/*"
              multiple
              aria-labelledby="post-file-label"
              aria-describedby="post-file-hint"
              onChange={handleAttachFileChange}
            />
            <label
              htmlFor="post-file"
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
          {attachFiles.length > 0 && (
            <ul
              className="board-write-attach-previews"
              aria-label="첨부 이미지 미리보기"
            >
              {attachFiles.map((file, index) => (
                <li key={`${file.name}-${file.size}-${file.lastModified}-${index}`} className="board-write-attach-preview">
                  <img
                    src={attachPreviewUrls[index]}
                    alt=""
                    className="board-write-attach-preview__img"
                  />
                  <span className="board-write-attach-preview__name">{file.name}</span>
                  <button
                    type="button"
                    className="board-write-attach-preview__remove"
                    onClick={() => removeAttachAt(index)}
                    aria-label={`${file.name} 첨부 제거`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="board-write-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/post/list")}
            disabled={loading}
          >
            목록
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "등록 중..." : "등록"}
          </Button>
        </div>
      </form>
    </div>
  );
}
