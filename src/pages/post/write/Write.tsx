import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "@/api/board";
import {
  ATTACHMENT_ALLOWLIST_FORM_ERROR,
  Button,
  ImageFileAttachField,
  isAllowedAttachmentFile,
  isAttachmentFileNameWithinLimit,
  isQuillContentEmpty,
  itemsToFiles,
  MAX_ATTACHMENT_FILENAME_LENGTH,
  PageHeader,
  RichTextEditor,
} from "@/components";
import type { FileWithId } from "@/components";
import { formDescribedBy } from "@/lib/a11y/formDescribedBy";
import {
  clearPostFormFieldError,
  type PostFormFieldErrors,
} from "@/lib/post/postFormFieldErrors";
import "@/pages/post/write/Write.scss";

const FIELD_IDS = {
  titleHint: "post-write-title-hint",
  titleError: "post-write-title-error",
  contentError: "post-write-content-error",
  attachError: "post-write-attach-error",
} as const;

export default function Write() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachFileItems, setAttachFileItems] = useState<FileWithId[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<PostFormFieldErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    if (attachFileItems.some((i) => !isAllowedAttachmentFile(i.file))) {
      setFieldErrors({ attach: ATTACHMENT_ALLOWLIST_FORM_ERROR });
      return;
    }
    if (attachFileItems.some((i) => !isAttachmentFileNameWithinLimit(i.file.name))) {
      setFieldErrors({
        attach: `첨부 파일명(확장자 포함)은 ${MAX_ATTACHMENT_FILENAME_LENGTH}자 이하여야 합니다.`,
      });
      return;
    }

    setLoading(true);
    try {
      const files = itemsToFiles(attachFileItems);
      const res = await createPost({
        title: title.trim(),
        content,
        attachFiles: files.length > 0 ? files : undefined,
        attachFileOrderList:
          files.length > 0
            ? attachFileItems.map((item) => item.file.name)
            : undefined,
      });
      if (res) {
        navigate("/post/list", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="board-write-page">
      <PageHeader
        badge="✏️ 글쓰기"
        title="게시글 등록"
        subtitle="제목과 내용을 입력한 뒤 등록해주세요."
        variant="centered"
      />

      <form className="board-write-form" onSubmit={handleSubmit} aria-labelledby="post-write-form-heading">
        <h2 id="post-write-form-heading" className="visually-hidden">
          게시글 입력
        </h2>

        <div className="post-form-group post-form-group--stacked">
          <div className="post-form-label-row">
            <label className="post-form-label" htmlFor="post-title">
              제목
            </label>
            <span id={FIELD_IDS.titleHint} className="post-form-hint">
              100자 이내
            </span>
          </div>
          <input
            id="post-title"
            type="text"
            className={`post-form-control${fieldErrors.title ? " error" : ""}`}
            placeholder="제목을 입력하세요 (100자 이내)"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setFieldErrors((prev) => clearPostFormFieldError(prev, "title"));
            }}
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
          <label className="post-form-label" id="post-content-label" htmlFor="post-content">
            내용
          </label>
          <RichTextEditor
            id="post-content"
            labelledBy="post-content-label"
            describedBy={formDescribedBy(
              fieldErrors.content && FIELD_IDS.contentError,
            )}
            invalid={!!fieldErrors.content}
            value={content}
            onChange={(value) => {
              setContent(value);
              setFieldErrors((prev) => clearPostFormFieldError(prev, "content"));
            }}
            placeholder="내용을 입력하세요"
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
          aria-labelledby="post-attach-heading"
          aria-describedby={formDescribedBy(
            fieldErrors.attach && FIELD_IDS.attachError,
          )}
        >
          <h2 className="post-form-label" id="post-attach-heading">
            첨부파일
          </h2>
          <ImageFileAttachField
            fileInputId="post-file"
            items={attachFileItems}
            onChange={(items) => {
              setAttachFileItems(items);
              setFieldErrors((prev) => clearPostFormFieldError(prev, "attach"));
            }}
            fileInputRef={fileInputRef}
          />
          {fieldErrors.attach ? (
            <p id={FIELD_IDS.attachError} className="post-form-field-error error-message" role="alert">
              {fieldErrors.attach}
            </p>
          ) : null}
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
