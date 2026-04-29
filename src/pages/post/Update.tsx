import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPostDetail, getPostFiles, updatePost } from "@/api/board";
import type { PostAttachmentItem, PostDetail } from "@/api/board";
import { Badge, Button, Confirm, LoadingState } from "@/components";
import { ImageFileAttachField } from "@/components/ImageFileAttachField/ImageFileAttachField";
import {
  isAttachmentFileNameWithinLimit,
  MAX_ATTACHMENT_FILENAME_LENGTH,
} from "@/components/ImageFileAttachField/fileAttachItemUtils";
import type { ImageFileUnifiedRow } from "@/components/ImageFileAttachField/ImageFileAttachField.types";
import { postDetailPath } from "@/pages/post/postDetailFromQuery";
import "@/pages/post/Detail.scss";
import "@/pages/post/Write.scss";
import "@/pages/post/Update.scss";

export default function Update() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idRaw = searchParams.get("id"); // 게시글 번호
  const postNumber = idRaw ? parseInt(idRaw, 10) : NaN; // 게시글 번호
  const invalidId = Number.isNaN(postNumber) || postNumber < 1; // 게시글 번호 유효성 검사

  const [post, setPost] = useState<PostDetail | null>(null);
  const [editAttachmentRows, setEditAttachmentRows] = useState<ImageFileUnifiedRow[]>([]); // 첨부 파일 목록
  const initialServerFileIdsRef = useRef<number[]>([]); // 로드 시점의 서버 fileId 목록
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
    if (invalidId) { // 게시글 번호 유효성 검사
      setLoading(false);
      return;
    }

    let cancelled = false;

    // 게시글 상세 조회 + 기존 첨부 목록
    (async () => {
      try {
        const [data, files] = await Promise.all([
          getPostDetail(postNumber), // 게시글 상세 조회
          getPostFiles(postNumber).catch(() => [] as PostAttachmentItem[]), // 기존 첨부 목록
        ]);
        if (cancelled) return;
        if (data == null) { // 게시글 상세 조회 실패
          setPost(null);
          setTitle("");
          setContent("");
          setEditAttachmentRows([]);
          initialServerFileIdsRef.current = []; // 기존 첨부 목록 초기화
        } else {
          setPost(data); // 게시글 상세 조회 성공
          setTitle(data.title);
          setContent(data.content ?? "");
          const sorted = [...files].sort((a, b) => a.sortOrder - b.sortOrder); // 기존 첨부 목록 정렬
          initialServerFileIdsRef.current = sorted.map((f) => f.fileId); // 기존 첨부 목록 ID 목록
          setEditAttachmentRows(
            sorted.map((f) => ({
              kind: "server" as const,
              fileId: f.fileId,
              name: f.fileName,
              ...(f.fileSize != null ? { sizeBytes: f.fileSize } : {}),
            }))
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [postNumber, invalidId]);

  // 저장 버튼 클릭 시 처리
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
    if (
      editAttachmentRows.some( // 새로 추가한 첨부 파일 유효성 검사
        (r) => r.kind === "local" && !isAttachmentFileNameWithinLimit(r.file.name)
      )
    ) {
      setError(
        `첨부 파일명(확장자 포함)은 ${MAX_ATTACHMENT_FILENAME_LENGTH}자 이하여야 합니다.`
      );
      return;
    }
    setError("");
    setSubmitLoading(true);
    try {
      const initialIds = initialServerFileIdsRef.current; // 로드 시점의 서버 fileId 목록
      const currentServerIds = editAttachmentRows // 기존 첨부 목록 ID 목록
        .filter((r): r is Extract<ImageFileUnifiedRow, { kind: "server" }> => r.kind === "server") // 기존 첨부 목록
        .map((r) => r.fileId); // 기존 첨부 목록 ID 목록
      const deleteFileIdList = initialIds.filter((id) => !currentServerIds.includes(id)); // 삭제할 파일 ID 목록

      const newFiles = editAttachmentRows
        .filter((r): r is Extract<ImageFileUnifiedRow, { kind: "local" }> => r.kind === "local") // 새로 추가한 첨부 파일
        .map((r) => r.file); // 새로 추가한 첨부 파일 파일 목록

      const everHadServerFiles = initialIds.length > 0; // 기존 첨부 목록이 있는지 여부

      // 첨부 파일 순서 목록
      const attachFileOrderList: string[] | undefined =
        editAttachmentRows.length > 0
          ? editAttachmentRows.map((r) => (r.kind === "server" ? r.name : r.file.name)) // 기존 첨부 목록은 파일명, 새로 추가한 첨부 파일은 파일명
          : everHadServerFiles
            ? [] // 기존 첨부 목록이 있으면 빈 배열
            : undefined;

      const ok = await updatePost(postNumber, { // 게시글 수정 요청 
        title: title.trim(),
        content: content.trim(),
        addAttachFiles: newFiles.length > 0 ? newFiles : undefined, // 새로 추가한 첨부 파일 파일 목록
        deleteFileIdList: deleteFileIdList.length > 0 ? deleteFileIdList : undefined, // 삭제할 파일 ID 목록
        attachFileOrderList, // 첨부 파일 순서 목록
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
                fileInputRef={fileInputRef} // 파일 입력 요소 참조
                unifiedRows={editAttachmentRows} // 첨부 파일 목록
                onUnifiedRowsChange={setEditAttachmentRows} // 첨부 파일 목록 변경 시 처리
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
