import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPostDetail, getPostFiles, updatePost } from "@/api/board";
import type { PostAttachmentItem, PostDetail } from "@/api/board";
import { Badge, Button, Confirm, LoadingState } from "@/components";
import { ImageFileAttachField } from "@/components/ImageFileAttachField/ImageFileAttachField";
import {
  isAttachmentFileNameWithinLimit,
  itemsToFiles,
  MAX_ATTACHMENT_FILENAME_LENGTH,
} from "@/components/ImageFileAttachField/fileAttachItemUtils";
import type { FileWithId } from "@/components/ImageFileAttachField/ImageFileAttachField.types";
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
  const [newAttachFileItems, setNewAttachFileItems] = useState<FileWithId[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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
        if (data == null) {
          setPost(null);
          setTitle("");
          setContent("");
          setExistingAttachments([]);
        } else {
          setPost(data);
          setTitle(data.title);
          setContent(data.content ?? "");
          setExistingAttachments(
            [...files].sort((a, b) => a.sortOrder - b.sortOrder)
          );
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
    if (newAttachFileItems.some((i) => !isAttachmentFileNameWithinLimit(i.file.name))) {
      setError(
        `첨부 파일명(확장자 포함)은 ${MAX_ATTACHMENT_FILENAME_LENGTH}자 이하여야 합니다.`
      );
      return;
    }
    setError("");
    setSubmitLoading(true);
    try {
      const newFiles = itemsToFiles(newAttachFileItems);
      const ok = await updatePost(postNumber, {
        title: title.trim(),
        content: content.trim(),
        attachFiles: newFiles.length > 0 ? newFiles : undefined,
        attachFileOrderList:
          newFiles.length > 0
            ? newAttachFileItems.map((item) => item.file.name)
            : undefined,
      });
      if (ok) {
        navigate(postDetailPath(postNumber, searchParams.get("from")), {
          replace: true,
        });
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // 취소 버튼 클릭 시 처리
  const handleCancelConfirm = () => {
    setShowCancelConfirm(false);
    navigate(postDetailPath(postNumber, searchParams.get("from")), { replace: true });
  };

  const showLoading = loading && !invalidId;
  const missingAfterLoad = !showLoading && !post && !invalidId;
  const showErrorSection = invalidId || Boolean(error) || missingAfterLoad;

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
              {invalidId
                ? "잘못된 게시글 번호입니다."
                : error || (missingAfterLoad ? "게시글을 불러오지 못했습니다." : "")}
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
              <span className="label">첨부파일</span>
              <ImageFileAttachField
                fileInputId="update-post-file"
                items={newAttachFileItems}
                onChange={setNewAttachFileItems}
                fileInputRef={fileInputRef}
                previousAttachments={existingAttachments.map((f) => ({
                  id: f.fileId,
                  name: f.fileName,
                }))}
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
