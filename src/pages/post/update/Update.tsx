import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPostDetail, getPostFiles, updatePost } from "@/api/board";
import type { PostAttachmentItem, PostDetail } from "@/api/board";
import {
  ATTACHMENT_ALLOWLIST_FORM_ERROR,
  Button,
  Confirm,
  ImageFileAttachField,
  isAllowedAttachmentFile,
  isAttachmentFileNameWithinLimit,
  isQuillContentEmpty,
  LoadingState,
  MAX_ATTACHMENT_FILENAME_LENGTH,
  PageHeader,
  RichTextEditor,
} from "@/components";
import type { ImageFileUnifiedRow } from "@/components";
import { formDescribedBy } from "@/lib/a11y/formDescribedBy";
import {
  listReturnPathFromFromQuery,
  postDetailPath,
} from "@/lib/post/postDetailFromQuery";
import {
  clearPostFormFieldError,
  type PostFormFieldErrors,
} from "@/lib/post/postFormFieldErrors";
import "@/pages/post/detail/Detail.scss";
import "@/pages/post/update/Update.scss";

const FIELD_IDS = {
  titleHint: "post-update-title-hint",
  titleError: "post-update-title-error",
  contentError: "post-update-content-error",
  attachError: "post-update-attach-error",
} as const;

export default function Update() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idRaw = searchParams.get("id"); // 게시글 번호
  const postNumber = idRaw ? parseInt(idRaw, 10) : NaN; // 게시글 번호
  const invalidId = Number.isNaN(postNumber) || postNumber < 1; // 게시글 번호 유효성 검사
  const listReturnPath = listReturnPathFromFromQuery(searchParams.get("from"));
  const listReturnLabel = listReturnPath === "/user/mypage" ? "마이페이지" : "목록";
  const listReturnTo = listReturnPath === "/user/mypage" ? "마이페이지로" : "목록으로";

  const [post, setPost] = useState<PostDetail | null>(null);
  const [editAttachmentRows, setEditAttachmentRows] = useState<ImageFileUnifiedRow[]>([]); // 첨부 파일 목록
  const initialServerFileIdsRef = useRef<number[]>([]); // 로드 시점의 서버 fileId 목록
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<PostFormFieldErrors>({});
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // 상세 + 기존 첨부 목록
  useEffect(() => {
    if (invalidId) return;

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
    setFieldErrors({});

    if (!title.trim()) {
      setFieldErrors({ title: "제목을 입력해주세요." });
      return;
    }
    if (isQuillContentEmpty(content)) {
      setFieldErrors({ content: "내용을 입력해주세요." });
      return;
    }
    // 첨부 파일 허용 여부 검사
    if (
      editAttachmentRows.some((r) => r.kind === "local" && !isAllowedAttachmentFile(r.file))
    ) {
      setFieldErrors({ attach: ATTACHMENT_ALLOWLIST_FORM_ERROR });
      return;
    }
    if (
      editAttachmentRows.some(
        (r) => r.kind === "local" && !isAttachmentFileNameWithinLimit(r.file.name)
      )
    ) {
      setFieldErrors({
        attach: `첨부 파일명(확장자 포함)은 ${MAX_ATTACHMENT_FILENAME_LENGTH}자 이하여야 합니다.`,
      });
      return;
    }
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
        content,
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

  // 목록 버튼 확인 시 처리
  const handleCancelConfirm = () => {
    setShowCancelConfirm(false);
    navigate(listReturnPath, { replace: true });
  };

  const showLoading = loading && !invalidId;
  const missingAfterLoad = !showLoading && !post && !invalidId;
  const showErrorSection = invalidId || missingAfterLoad;

  return (
    <div className="post-detail-page">
      <PageHeader badge="✏️ Edit" title="게시글 수정" variant="centered" />
      <div className="post-detail-actions">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowCancelConfirm(true)}
          disabled={submitLoading}
        >
          {listReturnLabel}
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
                : missingAfterLoad
                  ? "게시글을 불러오지 못했습니다."
                  : ""}
            </span>
          </div>
        ) : post ? (
          <div className="post-update-form" aria-labelledby="post-update-form-heading">
            <h2 id="post-update-form-heading" className="visually-hidden">
              게시글 수정 입력
            </h2>
            <div className="detail-meta">
              <span className="detail-id">#{post.postNumber}</span>
              <span className="detail-author">{post.rgtrInfo ?? "-"}</span>
              <span className="detail-date">{post.regDt}</span>
            </div>
            <div className="post-form-group post-form-group--stacked">
              <div className="post-form-label-row">
                <label className="post-form-label" htmlFor="update-title">
                  제목
                </label>
                <span id={FIELD_IDS.titleHint} className="post-form-hint">
                  100자 이내
                </span>
              </div>
              <input
                id="update-title"
                type="text"
                className={`post-form-control${fieldErrors.title ? " error" : ""}`}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setFieldErrors((prev) => clearPostFormFieldError(prev, "title"));
                }}
                placeholder="제목"
                maxLength={100}
                aria-invalid={!!fieldErrors.title}
                aria-describedby={formDescribedBy(
                  FIELD_IDS.titleHint,
                  fieldErrors.title && FIELD_IDS.titleError,
                )}
              />
              {fieldErrors.title ? (
                <p id={FIELD_IDS.titleError} className="post-form-field-error error-message" role="alert">
                  {fieldErrors.title}
                </p>
              ) : null}
            </div>
            <div className="post-form-group post-form-group--stacked">
              <label className="post-form-label" id="update-content-label" htmlFor="update-content">
                내용
              </label>
              <RichTextEditor
                id="update-content"
                labelledBy="update-content-label"
                describedBy={formDescribedBy(
                  fieldErrors.content && FIELD_IDS.contentError,
                )}
                invalid={!!fieldErrors.content}
                value={content}
                onChange={(value) => {
                  setContent(value);
                  setFieldErrors((prev) => clearPostFormFieldError(prev, "content"));
                }}
                placeholder="내용"
              />
              {fieldErrors.content ? (
                <p id={FIELD_IDS.contentError} className="post-form-field-error error-message" role="alert">
                  {fieldErrors.content}
                </p>
              ) : null}
            </div>

            <div
              className="post-form-group post-form-group--stacked"
              role="group"
              aria-labelledby="post-update-attach-heading"
              aria-describedby={formDescribedBy(
                fieldErrors.attach && FIELD_IDS.attachError,
              )}
            >
              <h2 className="post-form-label" id="post-update-attach-heading">
                첨부파일
              </h2>
              <ImageFileAttachField
                fileInputId="update-post-file"
                fileInputRef={fileInputRef}
                unifiedRows={editAttachmentRows}
                onUnifiedRowsChange={(rows) => {
                  setEditAttachmentRows(rows);
                  setFieldErrors((prev) => clearPostFormFieldError(prev, "attach"));
                }}
              />
              {fieldErrors.attach ? (
                <p id={FIELD_IDS.attachError} className="post-form-field-error error-message" role="alert">
                  {fieldErrors.attach}
                </p>
              ) : null}
            </div>
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
        message={`수정 내용을 저장하지 않고 ${listReturnTo} 이동하시겠습니까?`}
        onConfirm={handleCancelConfirm}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </div>
  );
}
