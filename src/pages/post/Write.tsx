import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "@/api/board";
import { Badge, Button } from "@/components";
import { ImageFileAttachField } from "@/components/ImageFileAttachField/ImageFileAttachField";
import {
  isAttachmentFileNameWithinLimit,
  itemsToFiles,
  MAX_ATTACHMENT_FILENAME_LENGTH,
} from "@/components/ImageFileAttachField/fileAttachItemUtils";
import type { FileWithId } from "@/components/ImageFileAttachField/ImageFileAttachField.types";
import "@/pages/post/Write.scss";

export default function Write() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachFileItems, setAttachFileItems] = useState<FileWithId[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null); // 파일 입력 요소 참조
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 등록 버튼 클릭 시 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // 제목 유효성 검사
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    // 내용 유효성 검사
    if (!content.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }
    // 첨부 파일 유효성 검사
    if (attachFileItems.some((i) => !isAttachmentFileNameWithinLimit(i.file.name))) {
      setError(
        `첨부 파일명(확장자 포함)은 ${MAX_ATTACHMENT_FILENAME_LENGTH}자 이하여야 합니다.`
      );
      return;
    }

    setLoading(true); // 로딩 상태 설정
    try {
      const files = itemsToFiles(attachFileItems);
      const res = await createPost({
        title: title.trim(),
        content: content.trim(),
        attachFiles: files.length > 0 ? files : undefined,
        attachFileOrderList:
          files.length > 0
            ? attachFileItems.map((item) => item.file.name) // 첨부 파일 이름 목록 배열
            : undefined,
      });
      if (res) {
        navigate("/post/list", { replace: true }); // 게시글 목록 페이지로 이동
      }
    } finally {
      setLoading(false); // 로딩 상태 초기화
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
          <span className="label">
            첨부파일
          </span>
          <ImageFileAttachField
            fileInputId="post-file"
            items={attachFileItems} // 첨부된 이미지 목록
            onChange={setAttachFileItems} // 첨부된 이미지 목록 변경
            fileInputRef={fileInputRef} // 파일 입력 요소 참조
          />
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
