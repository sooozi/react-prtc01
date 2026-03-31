import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost, BoardApiError } from "@/api/board";
import { Badge, Button } from "@/components";
import "@/pages/post/Write.scss";

export default function Write() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
